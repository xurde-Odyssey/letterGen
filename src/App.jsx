import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Sidebar from './components/Sidebar';
import LetterForm from './components/LetterForm';
import LetterPreview from './components/LetterPreview';
import { TEMPLATES } from './data/templates';
import { supabase } from './lib/supabaseClient';

const DRAFT_STORAGE_KEY = 'letter-generator:draft:v1';
const LETTERPAD_STORAGE_KEY = 'letter-generator:letterpad:v1';
const COMPANY_PROFILES_STORAGE_KEY = 'letter-generator:company-profiles:v1';
const LOCAL_STATE_META_KEY = 'letter-generator:state-meta:v1';
const SUPABASE_APP_STATE_TABLE = 'app_state';
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

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

const loadCompanyProfiles = () => {
  try {
    const raw = localStorage.getItem(COMPANY_PROFILES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
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

function App() {
  const savedDraft = loadSavedDraft();
  const initialCompanyProfiles = loadCompanyProfiles();
  const savedMeta = loadLocalStateMeta();
  const savedLetterpadImage = localStorage.getItem(LETTERPAD_STORAGE_KEY) || '';

  const [authLoading, setAuthLoading] = useState(true);
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
  const [companyProfiles, setCompanyProfiles] = useState(initialCompanyProfiles);
  const [selectedCompanyProfileId, setSelectedCompanyProfileId] = useState(() => savedDraft?.selectedCompanyProfileId || '');
  const [defaultCompanyProfileId, setDefaultCompanyProfileId] = useState(() => savedDraft?.defaultCompanyProfileId || '');
  const [letterpadImage, setLetterpadImage] = useState(savedLetterpadImage);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [formHistoryPast, setFormHistoryPast] = useState([]);
  const [formHistoryFuture, setFormHistoryFuture] = useState([]);
  const [localUpdatedAt, setLocalUpdatedAt] = useState(
    () => savedMeta?.updatedAt || savedDraft?.savedAt || ''
  );
  const [isCloudStateReady, setIsCloudStateReady] = useState(false);

  const activeTemplate = TEMPLATES.find((t) => t.id === activeTemplateId);
  const printRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const currentUserId = authSession?.user?.id || null;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: activeTemplate?.title || 'Letter',
  });

  const handleLogout = async () => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = null;
    await supabase.auth.signOut();
    setIsCloudStateReady(false);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setAuthSession(data.session || null);
      setAuthLoading(false);
    };

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session || null);
      setIsCloudStateReady(false);
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
    updateFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
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

    updateFormData((prev) => ({
      ...prev,
      Your_Company_Name: profile.companyName || prev.Your_Company_Name || '',
      Your_Name: profile.applicantName || prev.Your_Name || '',
      Company_Address: profile.companyAddress || prev.Company_Address || '',
      Pan_No: profile.panNo || prev.Pan_No || '',
      Signature_Stamp_Image: profile.signatureStampImage || prev.Signature_Stamp_Image || '',
    }));

    const nextLetterpad = profile.letterpadImage || '';
    setLetterpadImage(nextLetterpad);
    if (nextLetterpad) {
      localStorage.setItem(LETTERPAD_STORAGE_KEY, nextLetterpad);
    } else {
      localStorage.removeItem(LETTERPAD_STORAGE_KEY);
    }
  };

  const handleAddCompanyProfile = (profileInput) => {
    const profile = {
      id: `company-${Date.now()}`,
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
        id: `company-${Date.now()}`,
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
      localStorage.removeItem(LETTERPAD_STORAGE_KEY);
    }
    if (defaultCompanyProfileId === profileId) {
      setDefaultCompanyProfileId('');
    }
  };

  const handleLetterpadUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.alert('Please upload a PNG/JPG image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : '';
      setLetterpadImage(imageData);
      try {
        localStorage.setItem(LETTERPAD_STORAGE_KEY, imageData);
      } catch {
        window.alert('Letterpad image could not be saved locally (storage limit).');
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveLetterpad = () => {
    setLetterpadImage('');
    localStorage.removeItem(LETTERPAD_STORAGE_KEY);
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
    try {
      localStorage.setItem(COMPANY_PROFILES_STORAGE_KEY, JSON.stringify(companyProfiles));
    } catch {
      // Ignore storage errors.
    }
  }, [companyProfiles]);

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

    updateFormData((prev) => ({
      ...prev,
      Your_Company_Name: selectedProfile.companyName || prev.Your_Company_Name || '',
      Your_Name: selectedProfile.applicantName || prev.Your_Name || '',
      Company_Address: selectedProfile.companyAddress || prev.Company_Address || '',
      Pan_No: selectedProfile.panNo || prev.Pan_No || '',
      Signature_Stamp_Image: selectedProfile.signatureStampImage || prev.Signature_Stamp_Image || '',
    }));

    const nextLetterpad = selectedProfile.letterpadImage || '';
    setLetterpadImage(nextLetterpad);
    if (nextLetterpad) {
      localStorage.setItem(LETTERPAD_STORAGE_KEY, nextLetterpad);
    } else {
      localStorage.removeItem(LETTERPAD_STORAGE_KEY);
    }
  }, [companyProfiles, selectedCompanyProfileId]);

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
    if (!currentUserId) return;

    const syncInitialState = async () => {
      setSaveStatus('saving');
      const { data: cloudState, error } = await supabase
        .from(SUPABASE_APP_STATE_TABLE)
        .select('payload,updated_at')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error) {
        setSaveStatus('error');
        setIsCloudStateReady(true);
        return;
      }

      const localPayload = {
        activeTemplateId,
        formData,
        templateDrafts,
        previousTemplateId,
        companyProfiles,
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
        setIsCloudStateReady(true);
        return;
      }

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
        const nextProfiles = Array.isArray(cloudPayload.companyProfiles) ? cloudPayload.companyProfiles : [];
        const nextSelectedProfileId = cloudPayload.selectedCompanyProfileId || '';
        const nextDefaultProfileId = cloudPayload.defaultCompanyProfileId || '';
        const nextLetterpad = cloudPayload.letterpadImage || '';

        setActiveTemplateId(nextTemplateId);
        setFormData(nextFormData);
        setTemplateDrafts(nextTemplateDrafts);
        setPreviousTemplateId(nextPreviousTemplateId);
        setCompanyProfiles(nextProfiles);
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
          localStorage.setItem(COMPANY_PROFILES_STORAGE_KEY, JSON.stringify(nextProfiles));
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

      setIsCloudStateReady(true);
    };

    syncInitialState();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !isCloudStateReady) return;

    const payload = {
      activeTemplateId,
      formData,
      templateDrafts,
      previousTemplateId,
      companyProfiles,
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

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');

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
    <div className="flex bg-slate-100 min-h-screen overflow-hidden font-sans">
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
      />

      <div className="flex flex-1 overflow-hidden">
        <LetterForm
          template={activeTemplate}
          data={formData}
          onChange={handleFieldChange}
          onClear={clearForm}
          companyProfiles={companyProfiles}
          selectedCompanyProfileId={selectedCompanyProfileId}
          onSelectCompanyProfile={handleCompanyProfileSelect}
          saveStatus={saveStatus}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={formHistoryPast.length > 0}
          canRedo={formHistoryFuture.length > 0}
          onCopyPreviousData={handleCopyPreviousLetterData}
          canCopyPreviousData={Boolean(previousTemplateId && templateDrafts[previousTemplateId])}
        />

        <div className="flex-1 flex overflow-hidden">
          <LetterPreview ref={printRef} template={activeTemplate} data={formData} letterpadImage={letterpadImage} />
        </div>
      </div>
    </div>
  );
}

export default App;
