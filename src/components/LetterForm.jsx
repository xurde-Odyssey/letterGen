import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Copy, Check, Upload, X, Undo2, Redo2 } from 'lucide-react';
import { cn } from '../utils/cn';
import NepaliInputWithSuggestions from './NepaliInputWithSuggestions';
import { getCurrentNepaliDate } from 'nepali/dates';
import { smartConverter, translateWords } from '../letter-app-js-utility/branch';
import '../letter-app-js-utility/converter';
import '../letter-app-js-utility/nepali-inline';

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const PROFILE_LINKED_FIELD_IDS = new Set([
    'Your_Company_Name',
    'Your_Name',
    'Company_Address',
    'Pan_No',
]);
const LATIN_EXCLUSION_TOKENS = new Set([
    'date',
    'email',
    'phone',
    'mobile',
    'contact',
    'pan',
    'vat',
    'url',
    'website',
    'link',
    'code',
    'reference',
    'ref',
    'number',
    'no',
    'fiscal',
    'year',
    'month',
    'day',
    'days',
    'qty',
    'quantity',
    'percent',
    'percentage',
    'price',
    'amount',
    'bid',
    'tender',
    'invitation',
    'validity',
    'deposit',
    'notice',
    'bank',
    'account',
    'contract',
    'discount',
    'mail',
    'url',
    'id',
]);
const NEPALI_EXCLUSION_PATTERNS = [
    'मिति',
    'फोन',
    'इमेल',
    'सम्पर्क',
    'पान',
    'भ्याट',
    'सन्दर्भ',
    'कोड',
    'लिंक',
    'वेबसाइट',
    'पत्र नं',
    'ठेक्का नं',
    'नं.',
    'नं',
    'नम्बर',
    'अंकमा',
    'मूल्य',
    'दिन',
    'आर्थिक वर्ष',
];
const NEPALI_FIELD_FORCE_INCLUDE_IDS = new Set([
    'Date',
    'Notice_Date',
    'Notice_Number',
    'Fiscal_Year',
    'Amount',
    'Amount_In_Words',
    'Extra_Days',
    'Rate_Amount',
]);

smartConverter(true);

const shouldEnableNepaliTyping = (field) => {
    if (!field || !['text', 'textarea'].includes(field.type)) {
        return false;
    }

    if (NEPALI_FIELD_FORCE_INCLUDE_IDS.has(field.id)) {
        return true;
    }

    const searchableText = [field.id, field.label, field.placeholder]
        .filter(Boolean)
        .join(' ');
    const latinTokens = searchableText.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

    if (latinTokens.some((token) => LATIN_EXCLUSION_TOKENS.has(token))) {
        return false;
    }

    if (NEPALI_EXCLUSION_PATTERNS.some((pattern) => searchableText.includes(pattern))) {
        return false;
    }

    return field.type === 'textarea' || DEVANAGARI_REGEX.test(searchableText);
};

const transliterateWord = (word) => String(translateWords(word, false) || word).replace(/\s+$/, '');

const getInlineFieldProps = (fieldKey) => ({
    'data-nepali-inline': 'true',
    'data-inline-field-key': fieldKey,
});

const getFieldSection = (field) => {
    const searchableText = [field?.id, field?.label, field?.placeholder].filter(Boolean).join(' ');
    const normalizedText = searchableText.toLowerCase();

    if (
        field?.id === 'Addressee_Title' ||
        normalizedText.includes('office') ||
        searchableText.includes('कार्यालय') ||
        searchableText.includes('प्रापक') ||
        searchableText.includes('साविक ठेगाना')
    ) {
        return 'recipient';
    }

    if (
        PROFILE_LINKED_FIELD_IDS.has(field?.id) ||
        normalizedText.includes('company') ||
        searchableText.includes('फर्म') ||
        searchableText.includes('निवेदक') ||
        searchableText.includes('आवेदक')
    ) {
        return 'company';
    }

    return 'content';
};

const SECTION_META = {
    recipient: {
        title: 'Recipient',
        description: 'Office name, address, and addressee details.',
    },
    company: {
        title: 'Company',
        description: 'Applicant and company profile details.',
    },
    content: {
        title: 'Letter Content',
        description: 'Subject, body, products, and other template-specific inputs.',
    },
};

const LetterForm = ({
    template,
    data,
    onChange,
    onClear,
    companyProfiles,
    selectedCompanyProfileId,
    onSelectCompanyProfile,
    saveStatus,
    onSyncCompanyProfiles,
    companyProfilesSyncStatus,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onCopyPreviousData,
    canCopyPreviousData,
}) => {
    const [copied, setCopied] = useState(false);
    const formContainerRef = useRef(null);

    useEffect(() => {
        const inlineTyping = globalThis.NepaliInlineTyping;
        if (!template || !inlineTyping || !formContainerRef.current) {
            return undefined;
        }

        const bindings = inlineTyping.bind(
            formContainerRef.current.querySelectorAll('[data-nepali-inline="true"]'),
            {
                transliterateWord,
                triggerCharacters: [' '],
                onConverted: ({ element, value }) => {
                    const fieldKey = element.dataset.inlineFieldKey;
                    if (!fieldKey) {
                        return;
                    }

                    if (fieldKey.startsWith('product-list:')) {
                        const [, parentFieldId, itemIndex, itemKey] = fieldKey.split(':');
                        const list = Array.isArray(data[parentFieldId]) ? [...data[parentFieldId]] : [];
                        const index = Number(itemIndex);
                        if (!list[index]) {
                            return;
                        }
                        list[index] = { ...list[index], [itemKey]: value };
                        onChange(parentFieldId, list);
                        return;
                    }

                    onChange(fieldKey, value);
                },
            }
        );

        return () => {
            bindings.forEach((binding) => binding?.destroy?.());
        };
    }, [data, onChange, template]);

    if (!template) return null;

    const handleCopy = () => {
        const pageOne = template.content(data);
        const pageTwo = typeof template.secondPageContent === 'function' ? template.secondPageContent(data) : '';
        const pageThree = typeof template.thirdPageContent === 'function' ? template.thirdPageContent(data) : '';
        const text = [pageOne, pageTwo, pageThree]
            .filter(Boolean)
            .join('\n\n')
            .replace(/\[\[B\]\]([\s\S]*?)\[\[\/B\]\]/g, '$1')
            .replace(/\[\[LETTER_TITLE\]\]/g, 'Letter of Bid')
            .replace(/\[\[SELF_DECLARATION_TITLE\]\]/g, 'Self Declaration')
            .replace(/\[\[SIGNATURE\]\]/g, '');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSignatureUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            window.alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            onChange('Signature_Stamp_Image', reader.result);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const removeSignatureImage = () => {
        onChange('Signature_Stamp_Image', '');
    };

    const handleStampUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            window.alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            onChange('Stamp_Image', reader.result);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const removeStampImage = () => {
        onChange('Stamp_Image', '');
    };

    const isValidPan = (value) => /^\d{9}$/.test(String(value || '').trim());
    const showNepaliDateQuickFill = template.enableNepaliDateQuickFill !== false && template.group !== 'bidding';
    const isBiddingTemplate = template.group === 'bidding';
    let previousSection = '';

    return (
        <div ref={formContainerRef} className="w-96 bg-white border-r border-slate-200 h-screen flex flex-col no-print shrink-0 overflow-hidden shadow-inner">
            <div className="sticky top-0 z-20 p-6 border-b border-slate-200 flex flex-col gap-4 bg-slate-50/95 backdrop-blur">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Fill Details</h2>
                    <span className="text-xs font-semibold text-slate-500">
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Save failed' : 'Saved'}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onSyncCompanyProfiles}
                        disabled={!onSyncCompanyProfiles || companyProfilesSyncStatus === 'syncing'}
                        className={cn(
                            'px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
                            companyProfilesSyncStatus === 'syncing'
                                ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                                : 'border-brand-200 text-brand-700 hover:bg-brand-50'
                        )}
                    >
                        {companyProfilesSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Profiles'}
                    </button>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            className={cn(
                                'p-2 rounded-lg transition-colors',
                                canUndo ? 'text-slate-500 hover:text-brand-600 hover:bg-brand-50' : 'text-slate-300 cursor-not-allowed'
                            )}
                            title="Undo"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className={cn(
                                'p-2 rounded-lg transition-colors',
                                canRedo ? 'text-slate-500 hover:text-brand-600 hover:bg-brand-50' : 'text-slate-300 cursor-not-allowed'
                            )}
                            title="Redo"
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onCopyPreviousData}
                            disabled={!canCopyPreviousData}
                            className={cn(
                                'px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
                                canCopyPreviousData
                                    ? 'border-brand-200 text-brand-700 hover:bg-brand-50'
                                    : 'border-slate-200 text-slate-300 cursor-not-allowed'
                            )}
                            title="Copy previous letter data"
                        >
                            Copy Previous
                        </button>
                        <button
                            onClick={onClear}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Clear Form"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCopy}
                            className={cn(
                                'p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold',
                                copied ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'
                            )}
                            title="Copy Letter Content"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">
                        Select Company (आफ्नो फर्म छान्नुहोस्)
                    </label>
                    <select
                        value={selectedCompanyProfileId || ''}
                        onChange={(e) => onSelectCompanyProfile(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm font-nepali bg-white"
                    >
                        <option value="">Select company profile...</option>
                        {companyProfiles.map((profile) => (
                            <option key={profile.id} value={profile.id}>
                                {profile.companyName}
                            </option>
                        ))}
                    </select>
                </div>

                {template.fields.map((field) => {
                    const fieldValue = data[field.id] ?? field.defaultValue ?? '';
                    const showPanError = field.id === 'Pan_No' && fieldValue && !isValidPan(fieldValue);
                    const sectionKey = getFieldSection(field);
                    const shouldRenderSectionHeader = sectionKey !== previousSection;
                    const sectionMeta = SECTION_META[sectionKey];
                    const isProfileLinkedField = PROFILE_LINKED_FIELD_IDS.has(field.id);
                    const isProfileFilled = isProfileLinkedField && selectedCompanyProfileId && String(fieldValue || '').trim();
                    previousSection = sectionKey;

                    return (
                        <React.Fragment key={field.id}>
                            {shouldRenderSectionHeader && sectionMeta && (
                                <div className="pt-1">
                                    <div className="flex items-center gap-3 pb-2">
                                        <div className="h-px flex-1 bg-slate-200" />
                                        <div className="shrink-0 text-center">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                                {sectionMeta.title}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{sectionMeta.description}</p>
                                        </div>
                                        <div className="h-px flex-1 bg-slate-200" />
                                    </div>
                                </div>
                            )}

                            <div
                                className={cn(
                                    'space-y-2 group rounded-xl transition-colors',
                                    isProfileFilled && 'border border-emerald-200 bg-emerald-50/60 p-3'
                                )}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <label className="text-sm font-semibold text-slate-700 block transition-colors group-focus-within:text-brand-600">
                                        {field.label}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {isProfileFilled && (
                                            <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                                From profile
                                            </span>
                                        )}
                                        {field.id === 'Date' && showNepaliDateQuickFill && (
                                            <button
                                                type="button"
                                                onClick={() => onChange('Date', getCurrentNepaliDate())}
                                                className="text-xs px-2 py-1 rounded border border-brand-200 text-brand-700 hover:bg-brand-50"
                                            >
                                                आजको मिति
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {field.type === 'select' ? (
                                    <select
                                        value={fieldValue}
                                        onChange={(e) => onChange(field.id, e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all font-nepali bg-white"
                                    >
                                        <option value="" disabled>
                                            {field.placeholder || `${field.label} छान्नुहोस्...`}
                                        </option>
                                        {field.options?.map((option) => {
                                            const optionValue = typeof option === 'string' ? option : option.value;
                                            const optionLabel = typeof option === 'string' ? option : option.label;

                                            return (
                                                <option key={optionValue} value={optionValue}>
                                                    {optionLabel}
                                                </option>
                                            );
                                        })}
                                    </select>
                                ) : field.type === 'text' && Array.isArray(field.suggestions) && field.suggestions.length > 0 ? (
                                    <>
                                        <input
                                            type="text"
                                            list={`suggestions-${field.id}`}
                                            value={fieldValue}
                                            onChange={(e) => onChange(field.id, e.target.value)}
                                            placeholder={field.placeholder || ''}
                                            {...(shouldEnableNepaliTyping(field) ? getInlineFieldProps(field.id) : {})}
                                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all font-nepali bg-white"
                                        />
                                        <datalist id={`suggestions-${field.id}`}>
                                            {field.suggestions.map((item) => (
                                                <option key={item} value={item} />
                                            ))}
                                        </datalist>
                                    </>
                                ) : field.type === 'product-list' ? (
                                    <div className="space-y-3">
                                        {(Array.isArray(data[field.id]) ? data[field.id] : []).map((item, index) => (
                                            <div key={index} className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-semibold text-slate-600">Product {index + 1}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const list = Array.isArray(data[field.id]) ? data[field.id] : [];
                                                            onChange(field.id, list.filter((_, i) => i !== index));
                                                        }}
                                                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={item?.Product_Name || ''}
                                                    onChange={(e) => {
                                                        const list = Array.isArray(data[field.id]) ? [...data[field.id]] : [];
                                                        list[index] = { ...list[index], Product_Name: e.target.value };
                                                        onChange(field.id, list);
                                                    }}
                                                    placeholder="Product_Name (e.g., सिमेन्ट बेन्च)"
                                                    {...getInlineFieldProps(`product-list:${field.id}:${index}:Product_Name`)}
                                                    className="w-full p-2 border border-slate-200 rounded text-sm font-nepali bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={item?.Price_Number || ''}
                                                    onChange={(e) => {
                                                        const list = Array.isArray(data[field.id]) ? [...data[field.id]] : [];
                                                        list[index] = { ...list[index], Price_Number: e.target.value };
                                                        onChange(field.id, list);
                                                    }}
                                                    placeholder="Price_Number (e.g., ५०००)"
                                                    {...getInlineFieldProps(`product-list:${field.id}:${index}:Price_Number`)}
                                                    className="w-full p-2 border border-slate-200 rounded text-sm font-nepali bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={item?.Price_Words || ''}
                                                    onChange={(e) => {
                                                        const list = Array.isArray(data[field.id]) ? [...data[field.id]] : [];
                                                        list[index] = { ...list[index], Price_Words: e.target.value };
                                                        onChange(field.id, list);
                                                    }}
                                                    placeholder="Price_Words (e.g., अक्षरमा: पाँच हजार मात्र)"
                                                    {...getInlineFieldProps(`product-list:${field.id}:${index}:Price_Words`)}
                                                    className="w-full p-2 border border-slate-200 rounded text-sm font-nepali bg-white"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const list = Array.isArray(data[field.id]) ? data[field.id] : [];
                                                onChange(field.id, [...list, { Product_Name: '', Price_Number: '', Price_Words: '' }]);
                                            }}
                                            className="w-full px-3 py-2 rounded border border-brand-200 text-brand-700 text-sm font-semibold hover:bg-brand-50"
                                        >
                                            + Add Product
                                        </button>
                                    </div>
                                ) : (
                                    <NepaliInputWithSuggestions
                                        value={fieldValue}
                                        onChange={(newValue) => onChange(field.id, newValue)}
                                        placeholder={field.placeholder || ''}
                                        isTextarea={field.type === 'textarea'}
                                        isNepaliMode={false}
                                        inputProps={shouldEnableNepaliTyping(field) ? getInlineFieldProps(field.id) : undefined}
                                    />
                                )}
                                {showPanError && (
                                    <p className="text-xs text-red-600">PAN must be exactly 9 digits.</p>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">
                        {isBiddingTemplate ? 'Signature (for Signed:)' : 'हस्ताक्षर/स्टाम्प फोटो'}
                    </label>

                    {!isBiddingTemplate && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-600 block">
                                हस्ताक्षर खण्डको स्थान
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'right', label: 'Right' },
                                    { id: 'up-right', label: 'Up Right' },
                                    { id: 'down-right', label: 'Down Right' },
                                    { id: 'left', label: 'Left' },
                                    { id: 'up-left', label: 'Up Left' },
                                    { id: 'down-left', label: 'Down Left' },
                                ].map((placement) => (
                                    <button
                                        key={placement.id}
                                        type="button"
                                        onClick={() => onChange('Signature_Block_Placement', placement.id)}
                                        className={cn(
                                            'px-2 py-1.5 rounded border text-xs font-semibold transition-colors',
                                            (data.Signature_Block_Placement || 'right') === placement.id
                                                ? 'border-brand-300 bg-brand-50 text-brand-700'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        )}
                                    >
                                        {placement.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                            <Upload className="w-4 h-4" />
                            Upload Image
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleSignatureUpload}
                            />
                        </label>

                        {data.Signature_Stamp_Image && (
                            <button
                                type="button"
                                onClick={removeSignatureImage}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Remove
                            </button>
                        )}
                    </div>

                    {data.Signature_Stamp_Image && (
                        <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                            <img
                                src={data.Signature_Stamp_Image}
                                alt="Signature or stamp preview"
                                className="h-20 w-auto object-contain"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">
                        {isBiddingTemplate ? 'Stamp (bottom of each page)' : 'स्टाम्प फोटो'}
                    </label>
                    <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                            <Upload className="w-4 h-4" />
                            Upload Stamp
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleStampUpload}
                            />
                        </label>

                        {data.Stamp_Image && (
                            <button
                                type="button"
                                onClick={removeStampImage}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Remove
                            </button>
                        )}
                    </div>

                    {data.Stamp_Image && (
                        <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                            <img
                                src={data.Stamp_Image}
                                alt="Stamp preview"
                                className="h-20 w-auto object-contain"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LetterForm;
