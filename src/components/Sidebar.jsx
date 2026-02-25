import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { cn } from '../utils/cn';

const EMPTY_COMPANY_FORM = {
    companyName: '',
    applicantName: '',
    companyAddress: '',
    panNo: '',
    letterpadImage: '',
    signatureStampImage: '',
};

const normalizeDigitsToAscii = (value) =>
    String(value || '').replace(/[०-९]/g, (digit) => String(digit.charCodeAt(0) - 2406));

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
    onLogout,
    onChangePassword,
    letterpadError,
    onDismissLetterpadError,
}) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState('');
    const [companyForm, setCompanyForm] = useState(EMPTY_COMPANY_FORM);
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

    const clearCompanyFormMessages = () => {
        setCompanyFormError('');
        setCompanyFormSuccess('');
    };

    const openAddCompanyForm = () => {
        setEditingCompanyId('');
        setCompanyForm(EMPTY_COMPANY_FORM);
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
                    'fixed inset-y-0 left-0 z-40 w-80 bg-white border-r flex flex-col no-print shrink-0 overflow-y-auto transition-transform duration-300',
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    'md:static md:h-screen md:translate-x-0 md:z-auto'
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
                    {filteredTemplates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.id)}
                            className={cn(
                                'w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between group',
                                activeTemplateId === template.id
                                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                                    : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                            )}
                        >
                            <span className="font-medium text-sm leading-tight">{template.title}</span>
                            <ChevronRight
                                className={cn(
                                    'w-4 h-4 transition-transform duration-200',
                                    activeTemplateId === template.id
                                        ? 'translate-x-0 opacity-100'
                                        : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                                )}
                            />
                        </button>
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
                                        <p className="text-xs text-slate-500">No profiles saved yet.</p>
                                    )}
                                    {companyProfiles.map((profile) => (
                                        <div
                                            key={profile.id}
                                            className={cn(
                                                'p-3 rounded-lg border space-y-2',
                                                editingCompanyId === profile.id
                                                    ? 'border-brand-300 bg-brand-50'
                                                    : 'border-slate-200 bg-white'
                                            )}
                                        >
                                            <p className="text-sm font-semibold text-slate-800">{profile.companyName}</p>
                                            {defaultCompanyProfileId === profile.id && (
                                                <p className="text-[11px] inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                                                    <Star className="w-3 h-3" />
                                                    Default
                                                </p>
                                            )}
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
                                <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
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
                                    <input
                                        type="text"
                                        value={companyForm.companyName}
                                        onChange={(e) => {
                                            clearCompanyFormMessages();
                                            setCompanyForm((prev) => ({ ...prev, companyName: e.target.value }));
                                        }}
                                        placeholder="Company Name"
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

                                    <div className="pt-2 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveCompany}
                                            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
                                        >
                                            {editingCompanyId ? 'Update Profile' : 'Save Profile'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={openAddCompanyForm}
                                            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Reset
                                        </button>
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
