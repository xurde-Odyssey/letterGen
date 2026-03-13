import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FileText,
    Printer,
    ChevronRight,
    Upload,
    X,
    Settings,
    Pencil,
    Trash2,
    LogOut,
    Copy,
    Star,
    Lock,
    Menu,
    Building2,
    LoaderCircle,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { smartConverter, translateWords } from '../letter-app-js-utility/branch';
import '../letter-app-js-utility/converter';
import '../letter-app-js-utility/nepali-inline';

const EMPTY_COMPANY_FORM = {
    companyName: '',
    applicantName: '',
    companyAddress: '',
    panNo: '',
    letterpadImage: '',
    signatureStampImage: '',
};
const COMPANY_FORM_LANGUAGE_OPTIONS = [
    { id: 'english', label: 'English' },
    { id: 'nepali', label: 'Unicode Nepali' },
];

const normalizeDigitsToAscii = (value) =>
    String(value || '').replace(/[०-९]/g, (digit) => String(digit.charCodeAt(0) - 2406));

smartConverter(true);

const transliterateWord = (word) => String(translateWords(word, false) || word).replace(/\s+$/, '');

const getInlineFieldProps = (fieldKey) => ({
    'data-nepali-inline': 'true',
    'data-inline-field-key': fieldKey,
});

const getProfileInitials = (value) => {
    const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return 'CP';
    }
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const MOSTLY_USED_TEMPLATE_IDS = new Set([
    'vendor-registration',
    'payment-request',
    'cement-bench-quotation',
    'market-price-quotation',
]);

const Sidebar = ({
    templates,
    activeTemplateId,
    onSelect,
    onPrint,
    letterpadImage,
    onLetterpadUpload,
    onRemoveLetterpad,
    companyProfiles,
    onAddCompanyProfile,
    onUpdateCompanyProfile,
    onDeleteCompanyProfile,
    onDuplicateCompanyProfile,
    defaultCompanyProfileId,
    onSetDefaultCompanyProfile,
    companyProfilesSaveStatus,
    companyProfilesSaveError,
    onLogout,
    onChangePassword,
    letterpadError,
    companyProfilesError,
    onDismissLetterpadError,
}) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState('');
    const [companyForm, setCompanyForm] = useState(EMPTY_COMPANY_FORM);
    const [companyFormLanguage, setCompanyFormLanguage] = useState('nepali');
    const [templateSearch, setTemplateSearch] = useState('');
    const [companyFormError, setCompanyFormError] = useState('');
    const [companyFormSuccess, setCompanyFormSuccess] = useState('');
    const [localLetterpadError, setLocalLetterpadError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const companyFormRef = useRef(null);

    const renderCompanyProfilesStatus = (variant = 'sidebar') => {
        if (!(companyProfilesSaveStatus === 'saving' || companyProfilesSaveStatus === 'saved' || companyProfilesSaveStatus === 'error')) {
            return null;
        }

        const baseClass = variant === 'sidebar'
            ? 'rounded-lg border px-3 py-2 text-xs font-semibold'
            : 'rounded-lg border px-3 py-2 text-xs font-semibold';

        return (
            <div
                className={cn(
                    baseClass,
                    companyProfilesSaveStatus === 'saving' && (variant === 'sidebar'
                        ? 'border-brand-200/40 bg-white/10 text-white'
                        : 'border-brand-200 bg-brand-50 text-brand-700'),
                    companyProfilesSaveStatus === 'saved' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                    companyProfilesSaveStatus === 'error' && 'border-red-200 bg-red-50 text-red-700'
                )}
            >
                {companyProfilesSaveStatus === 'saving'
                    ? (
                        <span className="inline-flex items-center gap-2">
                            <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                            {variant === 'modal' && editingCompanyId ? 'Updating profile...' : 'Saving profiles...'}
                        </span>
                    )
                    : companyProfilesSaveStatus === 'saved'
                        ? 'Profiles synced'
                        : companyProfilesSaveError || 'Profile save failed'}
            </div>
        );
    };

    const editingCompany = useMemo(
        () => companyProfiles.find((profile) => profile.id === editingCompanyId) || null,
        [companyProfiles, editingCompanyId]
    );

    const filteredTemplates = useMemo(() => {
        const query = templateSearch.trim().toLowerCase();
        if (!query) return templates;
        return templates.filter((template) => {
            const title = String(template.title || '').toLowerCase();
            const subject = String(template.subject || '').toLowerCase();
            return title.includes(query) || subject.includes(query);
        });
    }, [templates, templateSearch]);

    const groupedTemplates = useMemo(() => {
        const groups = {
            mostlyUsed: {
                title: 'Mostly used',
                templates: [],
            },
            normal: {
                title: 'Normal letter',
                templates: [],
            },
            bidding: {
                title: 'Bidding section',
                templates: [],
            },
        };

        filteredTemplates.forEach((template) => {
            if (MOSTLY_USED_TEMPLATE_IDS.has(template.id)) {
                groups.mostlyUsed.templates.push(template);
                return;
            }

            const key = template.group === 'bidding' ? 'bidding' : 'normal';
            groups[key].templates.push(template);
        });

        return [groups.mostlyUsed, groups.normal, groups.bidding].filter((group) => group.templates.length > 0);
    }, [filteredTemplates]);

    const clearCompanyFormMessages = useCallback(() => {
        setCompanyFormError('');
        setCompanyFormSuccess('');
    }, []);

    useEffect(() => {
        const inlineTyping = globalThis.NepaliInlineTyping;
        if (!isCompanyModalOpen || companyFormLanguage !== 'nepali' || !inlineTyping || !companyFormRef.current) {
            return undefined;
        }

        const bindings = inlineTyping.bind(
            companyFormRef.current.querySelectorAll('[data-nepali-inline="true"]'),
            {
                transliterateWord,
                triggerCharacters: [' '],
                onConverted: ({ element, value }) => {
                    const fieldKey = element.dataset.inlineFieldKey;
                    if (!fieldKey) return;
                    clearCompanyFormMessages();
                    setCompanyForm((prev) => ({ ...prev, [fieldKey]: value }));
                },
            }
        );

        return () => {
            bindings.forEach((binding) => binding?.destroy?.());
        };
    }, [clearCompanyFormMessages, companyFormLanguage, isCompanyModalOpen]);

    const openAddCompanyForm = () => {
        setEditingCompanyId('');
        setCompanyForm(EMPTY_COMPANY_FORM);
        setCompanyFormLanguage('nepali');
        clearCompanyFormMessages();
    };

    const openEditCompanyForm = (profile) => {
        setEditingCompanyId(profile.id);
        setCompanyForm({
            companyName: profile.companyName || '',
            applicantName: profile.applicantName || '',
            companyAddress: profile.companyAddress || '',
            panNo: profile.panNo || '',
            letterpadImage: profile.letterpadImage || '',
            signatureStampImage: profile.signatureStampImage || '',
        });
        setCompanyFormLanguage('nepali');
        clearCompanyFormMessages();
    };

    const handleSaveCompany = () => {
        clearCompanyFormMessages();
        if (!companyForm.companyName.trim()) {
            setCompanyFormError('Company name is required.');
            return;
        }

        const normalizedPan = normalizeDigitsToAscii(companyForm.panNo.trim());
        if (companyForm.panNo && !/^\d{9}$/.test(normalizedPan)) {
            setCompanyFormError('PAN No. must be exactly 9 digits.');
            return;
        }

        if (editingCompanyId) {
            onUpdateCompanyProfile(editingCompanyId, companyForm);
            setCompanyFormSuccess('Company profile updated.');
        } else {
            onAddCompanyProfile(companyForm);
            setCompanyFormSuccess('Company profile saved.');
        }

        setEditingCompanyId('');
        setCompanyForm(EMPTY_COMPANY_FORM);
    };

    const requestDeleteCompany = (profile) => {
        setDeleteTarget(profile);
    };

    const closeDeleteModal = () => {
        setDeleteTarget(null);
    };

    const confirmDeleteCompany = () => {
        if (!deleteTarget?.id) return;
        const profileId = deleteTarget.id;
        onDeleteCompanyProfile(profileId);
        if (editingCompanyId === profileId) {
            openAddCompanyForm();
        }
        setDeleteTarget(null);
    };

    const handleImageUpload = (fieldName, event) => {
        clearCompanyFormMessages();
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setCompanyFormError('Please upload a PNG/JPG image.');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = typeof reader.result === 'string' ? reader.result : '';
            setCompanyForm((prev) => ({ ...prev, [fieldName]: base64 }));
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleTemplateSelect = (templateId) => {
        onSelect(templateId);
        setIsMobileSidebarOpen(false);
    };

    const handleLetterpadUploadInput = (event) => {
        setLocalLetterpadError('');
        if (onDismissLetterpadError) onDismissLetterpadError();
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setLocalLetterpadError('Please upload a PNG/JPG image.');
            event.target.value = '';
            return;
        }
        onLetterpadUpload(event);
    };

    const resetPasswordMessages = () => {
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        resetPasswordMessages();

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('All password fields are required.');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New password and confirm password do not match.');
            return;
        }
        if (passwordForm.currentPassword === passwordForm.newPassword) {
            setPasswordError('New password must be different from current password.');
            return;
        }

        setIsUpdatingPassword(true);
        const result = await onChangePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
        });
        setIsUpdatingPassword(false);

        if (!result.success) {
            setPasswordError(result.error || 'Failed to change password.');
            return;
        }

        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setPasswordSuccess('Password updated successfully.');
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden fixed top-3 left-3 z-30 inline-flex items-center gap-2 rounded-lg bg-brand-900 text-white px-3 py-2 shadow-lg"
            >
                <Menu className="w-4 h-4" />
                Menu
            </button>

            {isMobileSidebarOpen && (
                <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="md:hidden fixed inset-0 bg-slate-900/40 z-30"
                    aria-label="Close menu overlay"
                />
            )}

            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-40 w-72 bg-white border-r flex flex-col no-print shrink-0 overflow-y-auto transition-transform duration-300',
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    'md:translate-x-0 md:z-40'
                )}
            >
                <div className="p-6 border-b bg-brand-900 text-white space-y-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="w-6 h-6" />
                            Letter Generator
                        </h1>
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="md:hidden p-1.5 rounded-lg text-white/80 hover:bg-white/20"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-brand-300 uppercase tracking-wider font-semibold">
                        Official Letter Templates
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setIsCompanyModalOpen(true);
                            openAddCompanyForm();
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Manage Companies
                    </button>
                    {companyProfilesError && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            {companyProfilesError}
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <div className="pb-2">
                        <input
                            type="text"
                            value={templateSearch}
                            onChange={(e) => setTemplateSearch(e.target.value)}
                            placeholder="Search letters..."
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white"
                        />
                    </div>
                    {groupedTemplates.map((group) => (
                        <div key={group.title} className="space-y-2">
                            <p className="px-1 pt-2 text-[11px] uppercase tracking-wide font-bold text-slate-700">
                                {group.title}
                            </p>
                            {group.templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template.id)}
                                    className={cn(
                                        'w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between group border-l-4',
                                        activeTemplateId === template.id
                                            ? 'bg-brand-100 text-brand-800 border-y border-r border-brand-200 border-l-brand-600 shadow-md shadow-brand-100'
                                            : 'hover:bg-slate-50 text-slate-600 border-y border-r border-transparent border-l-transparent'
                                    )}
                                >
                                    <span className={cn('text-sm leading-tight', activeTemplateId === template.id ? 'font-bold' : 'font-medium')}>
                                        {template.title}
                                    </span>
                                    <ChevronRight
                                        className={cn(
                                            'w-4 h-4 transition-transform duration-200',
                                            activeTemplateId === template.id
                                                ? 'translate-x-0 opacity-100 text-brand-700'
                                                : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    ))}
                    {filteredTemplates.length === 0 && (
                        <p className="text-xs text-slate-500 px-1 py-2">No letters found.</p>
                    )}
                </nav>

                <div className="p-4 border-t bg-slate-50 space-y-3">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Upload Letterpad (PNG/JPG)
                        </label>
                        {(localLetterpadError || letterpadError) && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                {localLetterpadError || letterpadError}
                            </div>
                        )}
                        <label className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-brand-400 text-slate-700 hover:text-brand-700 bg-white py-2.5 px-3 rounded-xl text-sm font-medium cursor-pointer transition-colors">
                            <Upload className="w-4 h-4" />
                            Upload Letterpad
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                className="hidden"
                                onChange={handleLetterpadUploadInput}
                            />
                        </label>
                        {letterpadImage && (
                            <button
                                type="button"
                                onClick={onRemoveLetterpad}
                                className="w-full inline-flex items-center justify-center gap-2 border border-red-200 hover:border-red-300 text-red-600 bg-red-50 py-2 px-3 rounded-xl text-sm font-medium transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Remove Letterpad
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            onPrint();
                            setIsMobileSidebarOpen(false);
                        }}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-200 transition-all active:scale-[0.98]"
                    >
                        <Printer className="w-5 h-5" />
                        Print Letter
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onLogout();
                            setIsMobileSidebarOpen(false);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-red-300 text-slate-700 hover:text-red-600 bg-white py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-3">
                        A4 Standard Format • Unicode Nepali
                    </p>
                </div>
            </div>

            {isCompanyModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-3 md:p-4">
                    <div className="w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Manage Company Profiles</h3>
                            <button
                                type="button"
                                onClick={() => setIsCompanyModalOpen(false)}
                                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-0">
                            <div className="border-r p-4 overflow-y-auto">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-slate-700">Saved Companies</p>
                                    <button
                                        type="button"
                                        onClick={openAddCompanyForm}
                                        className="text-xs px-2 py-1 rounded border border-brand-200 text-brand-700 hover:bg-brand-50"
                                    >
                                        + New
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {companyProfiles.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center">
                                            <p className="text-sm font-semibold text-slate-700">No company profiles yet</p>
                                            <p className="mt-1 text-xs text-slate-500">Create your first reusable company card to fill letters faster.</p>
                                        </div>
                                    )}
                                    {companyProfiles.map((profile) => (
                                        <div
                                            key={profile.id}
                                            className={cn(
                                                'rounded-xl border p-3 space-y-3 transition-colors',
                                                editingCompanyId === profile.id
                                                    ? 'border-brand-300 bg-brand-50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                                                    {getProfileInitials(profile.companyName)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-sm font-semibold text-slate-800">{profile.companyName}</p>
                                                        {defaultCompanyProfileId === profile.id && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                                                <Star className="w-3 h-3" />
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    {profile.applicantName && (
                                                        <p className="mt-1 text-xs font-medium text-slate-600">{profile.applicantName}</p>
                                                    )}
                                                    <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                                                        {profile.panNo && <p>PAN: {profile.panNo}</p>}
                                                        {profile.companyAddress && <p className="line-clamp-2">{profile.companyAddress}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditCompanyForm(profile)}
                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDuplicateCompanyProfile(profile.id)}
                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                    Duplicate
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onSetDefaultCompanyProfile(profile.id)}
                                                    className={cn(
                                                        'inline-flex items-center gap-1 text-xs px-2 py-1 rounded border',
                                                        defaultCompanyProfileId === profile.id
                                                            ? 'border-amber-300 bg-amber-50 text-amber-700'
                                                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                                    )}
                                                >
                                                    <Star className="w-3 h-3" />
                                                    Set Default
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => requestDeleteCompany(profile)}
                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 overflow-y-auto space-y-4 bg-slate-50/60">
                                <section ref={companyFormRef} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-slate-800">
                                        <Building2 className="w-4 h-4" />
                                        <p className="text-sm font-semibold">
                                            {editingCompany ? `Editing: ${editingCompany.companyName}` : 'Add New Company'}
                                        </p>
                                    </div>
                                    {companyFormError && (
                                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                            {companyFormError}
                                        </div>
                                    )}
                                    {companyFormSuccess && (
                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                            {companyFormSuccess}
                                        </div>
                                    )}
                                    {renderCompanyProfilesStatus('modal')}
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-1 inline-flex gap-1">
                                        {COMPANY_FORM_LANGUAGE_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setCompanyFormLanguage(option.id)}
                                                className={cn(
                                                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                                                    companyFormLanguage === option.id
                                                        ? 'bg-white text-brand-700 shadow-sm'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                )}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={companyForm.companyName}
                                        onChange={(e) => {
                                            clearCompanyFormMessages();
                                            setCompanyForm((prev) => ({ ...prev, companyName: e.target.value }));
                                        }}
                                        placeholder="Company Name"
                                        {...(companyFormLanguage === 'nepali' ? getInlineFieldProps('companyName') : {})}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={companyForm.applicantName}
                                        onChange={(e) => {
                                            clearCompanyFormMessages();
                                            setCompanyForm((prev) => ({ ...prev, applicantName: e.target.value }));
                                        }}
                                        placeholder="Applicant Name"
                                        {...(companyFormLanguage === 'nepali' ? getInlineFieldProps('applicantName') : {})}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={companyForm.companyAddress}
                                        onChange={(e) => {
                                            clearCompanyFormMessages();
                                            setCompanyForm((prev) => ({ ...prev, companyAddress: e.target.value }));
                                        }}
                                        placeholder="Company Address"
                                        {...(companyFormLanguage === 'nepali' ? getInlineFieldProps('companyAddress') : {})}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={companyForm.panNo}
                                        onChange={(e) => {
                                            clearCompanyFormMessages();
                                            setCompanyForm((prev) => ({ ...prev, panNo: e.target.value }));
                                        }}
                                        placeholder="PAN No. (9 digits)"
                                        {...(companyFormLanguage === 'nepali' ? getInlineFieldProps('panNo') : {})}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                                    />

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-600">Letterpad Image</label>
                                        <label className="inline-flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                                            <Upload className="w-4 h-4" />
                                            Upload Letterpad
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg"
                                                className="hidden"
                                                onChange={(event) => handleImageUpload('letterpadImage', event)}
                                            />
                                        </label>
                                        {companyForm.letterpadImage && (
                                            <img
                                                src={companyForm.letterpadImage}
                                                alt="Letterpad preview"
                                                className="h-14 rounded border border-slate-200 object-cover"
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-600">Signature/Stamp Image</label>
                                        <label className="inline-flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                                            <Upload className="w-4 h-4" />
                                            Upload Signature/Stamp
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg"
                                                className="hidden"
                                                onChange={(event) => handleImageUpload('signatureStampImage', event)}
                                            />
                                        </label>
                                        {companyForm.signatureStampImage && (
                                            <img
                                                src={companyForm.signatureStampImage}
                                                alt="Signature preview"
                                                className="h-14 rounded border border-slate-200 object-contain"
                                            />
                                        )}
                                    </div>

                                    <div className="sticky bottom-0 -mx-4 -mb-4 mt-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs text-slate-500">
                                                {editingCompanyId ? 'Update this profile after reviewing the fields.' : 'Save this profile for reuse in Fill Details.'}
                                            </p>
                                            <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveCompany}
                                            className={cn(
                                                'px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors',
                                                companyProfilesSaveStatus === 'saving'
                                                    ? 'bg-brand-500 animate-pulse'
                                                    : 'bg-brand-600 hover:bg-brand-700'
                                            )}
                                        >
                                            {companyProfilesSaveStatus === 'saving'
                                                ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                                                        Saving...
                                                    </span>
                                                )
                                                : editingCompanyId
                                                    ? 'Update Profile'
                                                    : 'Save Profile'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={openAddCompanyForm}
                                            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Reset
                                        </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-slate-800">
                                        <Lock className="w-4 h-4" />
                                        <p className="text-sm font-semibold">Account Security</p>
                                    </div>
                                    <p className="text-xs text-slate-500">Change your login password for this account.</p>
                                    <form className="space-y-2.5" onSubmit={handlePasswordChange}>
                                        <input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => {
                                                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                                                resetPasswordMessages();
                                            }}
                                            placeholder="Current password"
                                            autoComplete="current-password"
                                            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                                        />
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => {
                                                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                                                resetPasswordMessages();
                                            }}
                                            placeholder="New password"
                                            autoComplete="new-password"
                                            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                                        />
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => {
                                                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                                                resetPasswordMessages();
                                            }}
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                                        />
                                        {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
                                        {passwordSuccess && <p className="text-xs text-emerald-700">{passwordSuccess}</p>}
                                        <button
                                            type="submit"
                                            disabled={isUpdatingPassword}
                                            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-base font-bold text-slate-800">Delete Company Profile?</h4>
                            <p className="text-sm text-slate-600">
                                This will permanently delete{' '}
                                <span className="font-semibold text-slate-800">{deleteTarget.companyName}</span>.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteCompany}
                                className="px-3.5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
