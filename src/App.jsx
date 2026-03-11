import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Sidebar from './components/Sidebar';
import LetterForm from './components/LetterForm';
import LetterPreview from './components/LetterPreview';
import { TEMPLATES } from './data/templates';
import { supabase, supabaseConfigError } from './lib/supabaseClient';

const DRAFT_STORAGE_KEY = 'letter-generator:draft:v1';
const LETTERPAD_STORAGE_KEY = 'letter-generator:letterpad:v1';
const COMPANY_PROFILES_STORAGE_KEY_PREFIX = 'letter-generator:company-profiles:v2';
const LOCAL_STATE_META_KEY = 'letter-generator:state-meta:v1';
const SUPABASE_APP_STATE_TABLE = 'app_state';
const SUPABASE_COMPANY_PROFILES_TABLE = 'company_profiles';
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PREVIEW_ZOOM_OPTIONS = [
  { label: '90%', value: 0.9 },
  { label: '100%', value: 1 },
  { label: '110%', value: 1.1 },
];

const loadSavedDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

const getCompanyProfilesStorageKey = (userId) => `${COMPANY_PROFILES_STORAGE_KEY_PREFIX}:${userId}`;

const loadCompanyProfiles = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getCompanyProfilesStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const persistCompanyProfilesLocally = (userId, profiles) => {
  if (!userId) return false;
  localStorage.setItem(getCompanyProfilesStorageKey(userId), JSON.stringify(profiles));
  return true;
};

const loadLocalStateMeta = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STATE_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

const generateUuid = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const randomValue = Math.floor(Math.random() * 16);
    const value = char === 'x' ? randomValue : ((randomValue & 0x3) | 0x8);
    return value.toString(16);
  });
};

const isUuid = (value) => UUID_REGEX.test(String(value || '').trim());

const toCompanyProfileRow = (profile, userId) => ({
  id: profile.id,
  user_id: userId,
  company_name: profile.companyName || '',
  applicant_name: profile.applicantName || '',
  company_address: profile.companyAddress || '',
  pan_no: profile.panNo || '',
  letterpad_image_base64: profile.letterpadImage || '',
  signature_stamp_image_base64: profile.signatureStampImage || '',
});

const fromCompanyProfileRow = (row) => ({
  id: row.id,
  companyName: row.company_name || '',
  applicantName: row.applicant_name || '',
  companyAddress: row.company_address || '',
  panNo: row.pan_no || '',
  letterpadImage: row.letterpad_image_base64 || '',
  signatureStampImage: row.signature_stamp_image_base64 || '',
});

function App() {
  const savedDraft = loadSavedDraft();
  const savedMeta = loadLocalStateMeta();
  let savedLetterpadImage = '';
  try {
    savedLetterpadImage = localStorage.getItem(LETTERPAD_STORAGE_KEY) || '';
  } catch {
    savedLetterpadImage = '';
  }

  const [authLoading, setAuthLoading] = useState(!supabaseConfigError);
  const [authSession, setAuthSession] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTemplateId, setActiveTemplateId] = useState(() => {
    const savedTemplateId = savedDraft?.activeTemplateId;
    const templateExists = TEMPLATES.some((t) => t.id === savedTemplateId);
    return templateExists ? savedTemplateId : TEMPLATES[0].id;
  });
  const [formData, setFormData] = useState(() => savedDraft?.formData || {});
  const [templateDrafts, setTemplateDrafts] = useState(() => savedDraft?.templateDrafts || {});
  const [previousTemplateId, setPreviousTemplateId] = useState(() => savedDraft?.previousTemplateId || '');
  const [companyProfiles, setCompanyProfiles] = useState([]);
  const [companyProfilesError, setCompanyProfilesError] = useState('');
  const [companyProfilesSyncStatus, setCompanyProfilesSyncStatus] = useState('idle');
  const [selectedCompanyProfileId, setSelectedCompanyProfileId] = useState(() => savedDraft?.selectedCompanyProfileId || '');
  const [defaultCompanyProfileId, setDefaultCompanyProfileId] = useState(() => savedDraft?.defaultCompanyProfileId || '');
  const [letterpadImage, setLetterpadImage] = useState(savedLetterpadImage);
  const [letterpadError, setLetterpadError] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [previewZoom, setPreviewZoom] = useState(1);
  const [formHistoryPast, setFormHistoryPast] = useState([]);
  const [formHistoryFuture, setFormHistoryFuture] = useState([]);
  const [localUpdatedAt, setLocalUpdatedAt] = useState(
    () => savedMeta?.updatedAt || savedDraft?.savedAt || ''
  );
  const [isCloudStateReady, setIsCloudStateReady] = useState(false);
  const [isCompanyProfilesSyncReady, setIsCompanyProfilesSyncReady] = useState(false);

  const activeTemplate = TEMPLATES.find((t) => t.id === activeTemplateId);
  const printRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const previousCompanyProfilesRef = useRef(companyProfiles);
  const currentUserId = authSession?.user?.id || null;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: activeTemplate?.title || 'Letter',
  });

  const persistLetterpadLocally = (nextLetterpad) => {
    try {
      if (nextLetterpad) {
        localStorage.setItem(LETTERPAD_STORAGE_KEY, nextLetterpad);
      } else {
        localStorage.removeItem(LETTERPAD_STORAGE_KEY);
      }
      return true;
    } catch {
      setLetterpadError('Letterpad image could not be saved locally (storage limit).');
      return false;
    }
  };

  const refreshCompanyProfilesFromDatabase = async () => {
    if (!supabase || !currentUserId) return;

    setCompanyProfilesSyncStatus('syncing');
    setCompanyProfilesError('');

    const { data: cloudProfiles, error } = await supabase
      .from(SUPABASE_COMPANY_PROFILES_TABLE)
      .select('id,company_name,applicant_name,company_address,pan_no,letterpad_image_base64,signature_stamp_image_base64,created_at')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: true });

    if (error) {
      setCompanyProfilesError(error.message || 'Failed to refresh company profiles from Supabase.');
      setCompanyProfilesSyncStatus('error');
      return;
    }

    const nextProfiles = Array.isArray(cloudProfiles) ? cloudProfiles.map(fromCompanyProfileRow) : [];
    previousCompanyProfilesRef.current = nextProfiles;
    setCompanyProfiles(nextProfiles);

    try {
      persistCompanyProfilesLocally(currentUserId, nextProfiles);
    } catch {
      setCompanyProfilesError('Company profiles refreshed from Supabase, but local cache update failed.');
    }

    const selectedExists = nextProfiles.some((profile) => profile.id === selectedCompanyProfileId);
    const defaultExists = nextProfiles.some((profile) => profile.id === defaultCompanyProfileId);
    if (!selectedExists) setSelectedCompanyProfileId('');
    if (!defaultExists) setDefaultCompanyProfileId('');

    setCompanyProfilesSyncStatus('synced');
  };

  const handleLogout = async () => {
    if (!supabase) return;
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = null;
    await supabase.auth.signOut();
    setIsCloudStateReady(false);
    setIsCompanyProfilesSyncReady(false);
  };

  useEffect(() => {
    let isMounted = true;
    if (!supabase) {
      setAuthLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const bootstrapAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setAuthSession(data.session || null);
      } catch {
        if (!isMounted) return;
        setAuthSession(null);
      } finally {
        if (!isMounted) return;
        setAuthLoading(false);
      }
    };

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session || null);
      setCompanyProfiles([]);
      setCompanyProfilesError('');
      setCompanyProfilesSyncStatus('idle');
      setIsCloudStateReady(false);
      setIsCompanyProfilesSyncReady(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
      return;
    }

    const resetTimer = () => {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    resetTimer();

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
      clearTimeout(inactivityTimerRef.current);
    };
  }, [currentUserId]);

  const handleTemplateSelect = (id) => {
    setPreviousTemplateId(activeTemplateId);
    setActiveTemplateId(id);
  };

  const updateFormData = (updater, recordHistory = true) => {
    setFormData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (recordHistory && JSON.stringify(prev) !== JSON.stringify(next)) {
        setFormHistoryPast((history) => [...history.slice(-49), prev]);
        setFormHistoryFuture([]);
      }
      return next;
    });
  };

  const handleFieldChange = (fieldId, value) => {
    updateFormData((prev) => {
      const next = {
        ...prev,
        [fieldId]: value,
      };

      if (activeTemplate?.group === 'bidding' && fieldId === 'Contract_Name') {
        next.Works_Title = value;
      }

      return next;
    });
  };

  const handleUndo = () => {
    setFormHistoryPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFormHistoryFuture((future) => [formData, ...future].slice(0, 50));
      setFormData(previous);
      return prev.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setFormHistoryFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setFormHistoryPast((history) => [...history.slice(-49), formData]);
      setFormData(next);
      return prev.slice(1);
    });
  };

  const handleCopyPreviousLetterData = () => {
    if (!previousTemplateId) return;
    const previousData = templateDrafts[previousTemplateId];
    if (!previousData || typeof previousData !== 'object') return;

    const currentTemplate = TEMPLATES.find((template) => template.id === activeTemplateId);
    if (!currentTemplate) return;

    const validFieldIds = new Set(currentTemplate.fields.map((field) => field.id));
    const filteredData = Object.entries(previousData).reduce((acc, [key, value]) => {
      if (validFieldIds.has(key)) acc[key] = value;
      return acc;
    }, {});

    if (Object.keys(filteredData).length === 0) return;

    updateFormData((prev) => ({
      ...prev,
      ...filteredData,
    }));
  };

  const handleCompanyProfileSelect = (profileId) => {
    setSelectedCompanyProfileId(profileId);
    const profile = companyProfiles.find((item) => item.id === profileId);
    if (!profile) return;
    const isBiddingTemplate = activeTemplate?.group === 'bidding';

    if (!isBiddingTemplate) {
      updateFormData((prev) => ({
        ...prev,
        Your_Company_Name: profile.companyName || prev.Your_Company_Name || '',
        Your_Name: profile.applicantName || prev.Your_Name || '',
        Company_Address: profile.companyAddress || prev.Company_Address || '',
        Pan_No: profile.panNo || prev.Pan_No || '',
        Signature_Stamp_Image: profile.signatureStampImage || prev.Signature_Stamp_Image || '',
      }));
    }

    const nextLetterpad = profile.letterpadImage || '';
    setLetterpadImage(nextLetterpad);
    persistLetterpadLocally(nextLetterpad);
  };

  const handleAddCompanyProfile = (profileInput) => {
    const profile = {
      id: generateUuid(),
      companyName: profileInput.companyName || '',
      applicantName: profileInput.applicantName || '',
      companyAddress: profileInput.companyAddress || '',
      panNo: profileInput.panNo || '',
      letterpadImage: profileInput.letterpadImage || '',
      signatureStampImage: profileInput.signatureStampImage || '',
    };

    setCompanyProfiles((prev) => [...prev, profile]);
  };

  const handleDuplicateCompanyProfile = (profileId) => {
    const source = companyProfiles.find((profile) => profile.id === profileId);
    if (!source) return;
    setCompanyProfiles((prev) => [
      ...prev,
      {
        ...source,
        id: generateUuid(),
        companyName: `${source.companyName} (Copy)`,
      },
    ]);
  };

  const handleSetDefaultCompanyProfile = (profileId) => {
    setDefaultCompanyProfileId(profileId);
  };

  const handleUpdateCompanyProfile = (profileId, profileInput) => {
    setCompanyProfiles((prev) =>
      prev.map((profile) =>
        profile.id === profileId
          ? {
              ...profile,
              companyName: profileInput.companyName || '',
              applicantName: profileInput.applicantName || '',
              companyAddress: profileInput.companyAddress || '',
              panNo: profileInput.panNo || '',
              letterpadImage: profileInput.letterpadImage || '',
              signatureStampImage: profileInput.signatureStampImage || '',
            }
          : profile
      )
    );
  };

  const handleDeleteCompanyProfile = (profileId) => {
    setCompanyProfiles((prev) => prev.filter((profile) => profile.id !== profileId));

    if (selectedCompanyProfileId === profileId) {
      setSelectedCompanyProfileId('');
      setLetterpadImage('');
      persistLetterpadLocally('');
    }
    if (defaultCompanyProfileId === profileId) {
      setDefaultCompanyProfileId('');
    }
  };

  const handleLetterpadUpload = (event) => {
    setLetterpadError('');
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLetterpadError('Please upload a PNG/JPG image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : '';
      setLetterpadImage(imageData);
      persistLetterpadLocally(imageData);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveLetterpad = () => {
    setLetterpadImage('');
    setLetterpadError('');
    persistLetterpadLocally('');
  };

  const clearForm = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      updateFormData({}, false);
      setFormHistoryPast([]);
      setFormHistoryFuture([]);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setLocalUpdatedAt(new Date().toISOString());
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          activeTemplateId,
          formData,
          templateDrafts,
          selectedCompanyProfileId,
          defaultCompanyProfileId,
          previousTemplateId,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore storage errors (private mode/quota restrictions).
    }
  }, [activeTemplateId, formData, templateDrafts, selectedCompanyProfileId, defaultCompanyProfileId, previousTemplateId]);

  useEffect(() => {
    if (!currentUserId) return;
    try {
      persistCompanyProfilesLocally(currentUserId, companyProfiles);
    } catch {
      setCompanyProfilesError('Company profiles could not be cached locally on this device.');
    }
  }, [currentUserId, companyProfiles]);

  useEffect(() => {
    if (!activeTemplateId) return;
    setTemplateDrafts((prev) => ({
      ...prev,
      [activeTemplateId]: formData,
    }));
  }, [activeTemplateId, formData]);

  useEffect(() => {
    if (!selectedCompanyProfileId) return;
    const selectedProfile = companyProfiles.find((profile) => profile.id === selectedCompanyProfileId);
    if (!selectedProfile) return;
    const currentTemplate = TEMPLATES.find((template) => template.id === activeTemplateId);
    const isBiddingTemplate = currentTemplate?.group === 'bidding';

    if (!isBiddingTemplate) {
      updateFormData((prev) => ({
        ...prev,
        Your_Company_Name: selectedProfile.companyName || prev.Your_Company_Name || '',
        Your_Name: selectedProfile.applicantName || prev.Your_Name || '',
        Company_Address: selectedProfile.companyAddress || prev.Company_Address || '',
        Pan_No: selectedProfile.panNo || prev.Pan_No || '',
        Signature_Stamp_Image: selectedProfile.signatureStampImage || prev.Signature_Stamp_Image || '',
      }));
    }

    const nextLetterpad = selectedProfile.letterpadImage || '';
    setLetterpadImage(nextLetterpad);
    persistLetterpadLocally(nextLetterpad);
  }, [companyProfiles, selectedCompanyProfileId, activeTemplateId]);

  useEffect(() => {
    if (!selectedCompanyProfileId && defaultCompanyProfileId) {
      const defaultProfileExists = companyProfiles.some((profile) => profile.id === defaultCompanyProfileId);
      if (defaultProfileExists) {
        handleCompanyProfileSelect(defaultCompanyProfileId);
      }
    }
  }, [companyProfiles, defaultCompanyProfileId, selectedCompanyProfileId]);

  useEffect(() => {
    if (!isCloudStateReady) return;
    const updatedAt = new Date().toISOString();
    setLocalUpdatedAt(updatedAt);
    try {
      localStorage.setItem(LOCAL_STATE_META_KEY, JSON.stringify({ updatedAt }));
    } catch {
      // Ignore storage errors.
    }
  }, [isCloudStateReady, activeTemplateId, formData, companyProfiles, selectedCompanyProfileId, defaultCompanyProfileId, letterpadImage]);

  useEffect(() => {
    if (!supabase || !currentUserId) return;

    const syncInitialState = async () => {
      setSaveStatus('saving');
      setCompanyProfilesError('');
      const scopedLocalProfiles = loadCompanyProfiles(currentUserId);
      let sourceProfiles = scopedLocalProfiles;
      let sourceSelectedProfileId = selectedCompanyProfileId;
      let sourceDefaultProfileId = defaultCompanyProfileId;

      const { data: cloudState, error } = await supabase
        .from(SUPABASE_APP_STATE_TABLE)
        .select('payload,updated_at')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error) {
        setSaveStatus('error');
        setIsCloudStateReady(true);
        setIsCompanyProfilesSyncReady(true);
        return;
      }

      const localPayload = {
        activeTemplateId,
        formData,
        templateDrafts,
        previousTemplateId,
        selectedCompanyProfileId,
        defaultCompanyProfileId,
        letterpadImage,
        updatedAt: localUpdatedAt,
      };

      if (!cloudState) {
        const { error: upsertError } = await supabase.from(SUPABASE_APP_STATE_TABLE).upsert({
          user_id: currentUserId,
          payload: localPayload,
        });
        setSaveStatus(upsertError ? 'error' : 'saved');
      } else {
        const cloudPayload = cloudState.payload || {};
        const cloudUpdatedAt = cloudPayload.updatedAt || cloudState.updated_at || '';
        const cloudTs = cloudUpdatedAt ? new Date(cloudUpdatedAt).getTime() : 0;
        const localTs = localUpdatedAt ? new Date(localUpdatedAt).getTime() : 0;
        const isCloudNewer = cloudTs > localTs;

        if (isCloudNewer) {
          const nextTemplateId = TEMPLATES.some((t) => t.id === cloudPayload.activeTemplateId)
            ? cloudPayload.activeTemplateId
            : TEMPLATES[0].id;
          const nextFormData = cloudPayload.formData && typeof cloudPayload.formData === 'object' ? cloudPayload.formData : {};
          const nextTemplateDrafts = cloudPayload.templateDrafts && typeof cloudPayload.templateDrafts === 'object'
            ? cloudPayload.templateDrafts
            : {};
          const nextPreviousTemplateId = cloudPayload.previousTemplateId || '';
          const nextSelectedProfileId = cloudPayload.selectedCompanyProfileId || '';
          const nextDefaultProfileId = cloudPayload.defaultCompanyProfileId || '';
          const nextLetterpad = cloudPayload.letterpadImage || '';
          sourceSelectedProfileId = nextSelectedProfileId;
          sourceDefaultProfileId = nextDefaultProfileId;

          setActiveTemplateId(nextTemplateId);
          setFormData(nextFormData);
          setTemplateDrafts(nextTemplateDrafts);
          setPreviousTemplateId(nextPreviousTemplateId);
          setSelectedCompanyProfileId(nextSelectedProfileId);
          setDefaultCompanyProfileId(nextDefaultProfileId);
          setLetterpadImage(nextLetterpad);
          setLocalUpdatedAt(cloudUpdatedAt || new Date().toISOString());
          setFormHistoryPast([]);
          setFormHistoryFuture([]);

          try {
            localStorage.setItem(
              DRAFT_STORAGE_KEY,
              JSON.stringify({
                activeTemplateId: nextTemplateId,
                formData: nextFormData,
                templateDrafts: nextTemplateDrafts,
                selectedCompanyProfileId: nextSelectedProfileId,
                defaultCompanyProfileId: nextDefaultProfileId,
                previousTemplateId: nextPreviousTemplateId,
                savedAt: cloudUpdatedAt || new Date().toISOString(),
              })
            );
            if (nextLetterpad) {
              localStorage.setItem(LETTERPAD_STORAGE_KEY, nextLetterpad);
            } else {
              localStorage.removeItem(LETTERPAD_STORAGE_KEY);
            }
            localStorage.setItem(LOCAL_STATE_META_KEY, JSON.stringify({ updatedAt: cloudUpdatedAt || new Date().toISOString() }));
          } catch {
            // Ignore storage errors.
          }
        } else {
          const { error: upsertError } = await supabase.from(SUPABASE_APP_STATE_TABLE).upsert({
            user_id: currentUserId,
            payload: localPayload,
          });
          setSaveStatus(upsertError ? 'error' : 'saved');
        }
      }

      const { data: cloudProfiles, error: profilesReadError } = await supabase
        .from(SUPABASE_COMPANY_PROFILES_TABLE)
        .select('id,company_name,applicant_name,company_address,pan_no,letterpad_image_base64,signature_stamp_image_base64,created_at')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: true });

      let resolvedProfiles = [];
      const cloudMappedProfiles = !profilesReadError && Array.isArray(cloudProfiles)
        ? cloudProfiles.map(fromCompanyProfileRow)
        : [];
      const localNormalizedProfiles = Array.isArray(sourceProfiles)
        ? sourceProfiles.map((profile) => ({
            ...profile,
            id: isUuid(profile.id) ? profile.id : generateUuid(),
          }))
        : [];
      if (profilesReadError) {
        resolvedProfiles = localNormalizedProfiles;
        setCompanyProfilesError('Could not load company profiles from Supabase. Showing locally cached profiles.');
      } else if (cloudMappedProfiles.length > 0) {
        resolvedProfiles = cloudMappedProfiles;
      } else {
        resolvedProfiles = localNormalizedProfiles;

        if (localNormalizedProfiles.length > 0) {
          const { error: seedProfilesError } = await supabase
            .from(SUPABASE_COMPANY_PROFILES_TABLE)
            .upsert(
              localNormalizedProfiles.map((profile) => toCompanyProfileRow(profile, currentUserId)),
              { onConflict: 'id' }
            );

          if (seedProfilesError) {
            setCompanyProfilesError('Company profiles loaded locally, but syncing them to Supabase failed.');
          }
        }
      }

      setCompanyProfiles(resolvedProfiles);
      try {
        persistCompanyProfilesLocally(currentUserId, resolvedProfiles);
      } catch {
        setCompanyProfilesError((prev) => prev || 'Company profiles could not be cached locally on this device.');
      }

      const selectedExists = resolvedProfiles.some((profile) => profile.id === sourceSelectedProfileId);
      const defaultExists = resolvedProfiles.some((profile) => profile.id === sourceDefaultProfileId);
      if (!selectedExists) setSelectedCompanyProfileId('');
      if (!defaultExists) setDefaultCompanyProfileId('');
      previousCompanyProfilesRef.current = resolvedProfiles;
      setIsCloudStateReady(true);
      setIsCompanyProfilesSyncReady(true);
    };

    syncInitialState();
  }, [currentUserId]);

  useEffect(() => {
    if (!supabase || !currentUserId || !isCloudStateReady) return;

    const payload = {
      activeTemplateId,
      formData,
      templateDrafts,
      previousTemplateId,
      selectedCompanyProfileId,
      defaultCompanyProfileId,
      letterpadImage,
      updatedAt: localUpdatedAt,
    };

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      const { error } = await supabase.from(SUPABASE_APP_STATE_TABLE).upsert({
        user_id: currentUserId,
        payload,
      });
      setSaveStatus(error ? 'error' : 'saved');
    }, 500);

    return () => clearTimeout(timer);
  }, [
    currentUserId,
    isCloudStateReady,
    activeTemplateId,
    formData,
    templateDrafts,
    previousTemplateId,
    companyProfiles,
    selectedCompanyProfileId,
    defaultCompanyProfileId,
    letterpadImage,
    localUpdatedAt,
  ]);

  useEffect(() => {
    if (!supabase || !currentUserId || !isCompanyProfilesSyncReady) return;

    const syncCompanyProfiles = async () => {
      setCompanyProfilesError('');
      const previousProfiles = previousCompanyProfilesRef.current || [];
      const previousIds = new Set(previousProfiles.map((profile) => profile.id));
      const nextIds = new Set(companyProfiles.map((profile) => profile.id));
      const deletedIds = previousProfiles
        .filter((profile) => !nextIds.has(profile.id))
        .map((profile) => profile.id);

      if (deletedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from(SUPABASE_COMPANY_PROFILES_TABLE)
          .delete()
          .eq('user_id', currentUserId)
          .in('id', deletedIds);
        if (deleteError) {
          setCompanyProfilesError(deleteError.message || 'Failed to delete company profiles from Supabase.');
          return;
        }
      }

      if (companyProfiles.length > 0) {
        const upsertRows = companyProfiles.map((profile) =>
          toCompanyProfileRow(
            {
              ...profile,
              id: isUuid(profile.id) ? profile.id : generateUuid(),
            },
            currentUserId
          )
        );

        const { error: upsertError } = await supabase
          .from(SUPABASE_COMPANY_PROFILES_TABLE)
          .upsert(upsertRows, { onConflict: 'id' });
        if (upsertError) {
          setCompanyProfilesError(upsertError.message || 'Failed to sync company profiles to Supabase.');
          return;
        }
      } else if (previousIds.size > 0) {
        const { error: deleteAllError } = await supabase
          .from(SUPABASE_COMPANY_PROFILES_TABLE)
          .delete()
          .eq('user_id', currentUserId);
        if (deleteAllError) {
          setCompanyProfilesError(deleteAllError.message || 'Failed to clear company profiles from Supabase.');
          return;
        }
      }

      previousCompanyProfilesRef.current = companyProfiles;
    };

    syncCompanyProfiles();
  }, [currentUserId, isCompanyProfilesSyncReady, companyProfiles]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    if (!supabase) {
      setLoginError('Supabase is not configured. Please contact admin.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
      return;
    }

    setLoginEmail('');
    setLoginPassword('');
  };

  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }
    const email = authSession?.user?.email;
    if (!email) {
      return { success: false, error: 'Could not determine account email. Please log in again.' };
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (verifyError) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { success: false, error: updateError.message || 'Failed to update password.' };
    }

    return { success: true, error: '' };
  };

  if (supabaseConfigError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-3">
          <h1 className="text-2xl font-bold text-slate-800">Supabase Configuration Missing</h1>
          <p className="text-sm text-slate-600">
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment
            variables, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <p className="text-sm text-slate-600">Checking authentication...</p>
      </div>
    );
  }

  if (!authSession) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Letter Generator Login</h1>
            <p className="text-sm text-slate-500">Sign in with your Supabase account.</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 h-screen overflow-hidden font-sans">
      <Sidebar
        templates={TEMPLATES}
        activeTemplateId={activeTemplateId}
        onSelect={handleTemplateSelect}
        onPrint={handlePrint}
        letterpadImage={letterpadImage}
        onLetterpadUpload={handleLetterpadUpload}
        onRemoveLetterpad={handleRemoveLetterpad}
        companyProfiles={companyProfiles}
        onAddCompanyProfile={handleAddCompanyProfile}
        onUpdateCompanyProfile={handleUpdateCompanyProfile}
        onDeleteCompanyProfile={handleDeleteCompanyProfile}
        onDuplicateCompanyProfile={handleDuplicateCompanyProfile}
        defaultCompanyProfileId={defaultCompanyProfileId}
        onSetDefaultCompanyProfile={handleSetDefaultCompanyProfile}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
        letterpadError={letterpadError}
        companyProfilesError={companyProfilesError}
        onDismissLetterpadError={() => setLetterpadError('')}
        onRefreshCompanyProfiles={refreshCompanyProfilesFromDatabase}
        companyProfilesSyncStatus={companyProfilesSyncStatus}
      />

      <div className="md:pl-72 h-full overflow-hidden">
        <div className="flex h-full overflow-hidden">
          <LetterForm
            template={activeTemplate}
            data={formData}
            onChange={handleFieldChange}
            onClear={clearForm}
            companyProfiles={companyProfiles}
            selectedCompanyProfileId={selectedCompanyProfileId}
            onSelectCompanyProfile={handleCompanyProfileSelect}
            saveStatus={saveStatus}
            onSyncCompanyProfiles={refreshCompanyProfilesFromDatabase}
            companyProfilesSyncStatus={companyProfilesSyncStatus}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={formHistoryPast.length > 0}
            canRedo={formHistoryFuture.length > 0}
            onCopyPreviousData={handleCopyPreviousLetterData}
            canCopyPreviousData={Boolean(previousTemplateId && templateDrafts[previousTemplateId])}
          />

          <div className="flex-1 min-w-0 border-l border-slate-200 bg-slate-50 flex flex-col">
            <div className="sticky top-0 z-10 no-print px-6 py-4 border-b border-slate-200 bg-white/95 backdrop-blur">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Preview</p>
                  <h2 className="text-base font-semibold text-slate-800">{activeTemplate?.title || 'Letter Preview'}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Zoom</span>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {PREVIEW_ZOOM_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setPreviewZoom(option.value)}
                        className={
                          previewZoom === option.value
                            ? 'rounded-md bg-white px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm'
                            : 'rounded-md px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700'
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <LetterPreview ref={printRef} template={activeTemplate} data={formData} letterpadImage={letterpadImage} zoom={previewZoom} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
