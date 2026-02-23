import React, { useState } from 'react';
import { Trash2, Copy, Check, Upload, X, Undo2, Redo2 } from 'lucide-react';
import { cn } from '../utils/cn';
import NepaliInputWithSuggestions from './NepaliInputWithSuggestions';

const LetterForm = ({
    template,
    data,
    onChange,
    onClear,
    companyProfiles,
    selectedCompanyProfileId,
    onSelectCompanyProfile,
    saveStatus,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
}) => {
    const [copied, setCopied] = useState(false);

    if (!template) return null;

    const handleCopy = () => {
        const text = template.content(data);
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

    const isValidPan = (value) => /^\d{9}$/.test(String(value || '').trim());

    return (
        <div className="w-96 bg-white border-r h-screen flex flex-col no-print shrink-0 overflow-hidden shadow-inner">
            <div className="p-6 border-b flex flex-col gap-4 bg-slate-50">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Fill Details</h2>
                    <span className="text-xs font-semibold text-slate-500">
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Save failed' : 'Saved'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
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

                    return (
                        <div key={field.id} className="space-y-2 group">
                            <label className="text-sm font-semibold text-slate-700 block transition-colors group-focus-within:text-brand-600">
                                {field.label}
                            </label>

                            {field.type === 'select' ? (
                                <select
                                    value={fieldValue}
                                    onChange={(e) => onChange(field.id, e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all font-nepali bg-white"
                                >
                                    <option value="" disabled>
                                        {field.placeholder || `${field.label} छान्नुहोस्...`}
                                    </option>
                                    {field.options?.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
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
                                    placeholder={field.placeholder || `${field.label} प्रविष्ट गर्नुहोस्...`}
                                    isTextarea={field.type === 'textarea'}
                                    isNepaliMode={true}
                                />
                            )}
                            {showPanError && (
                                <p className="text-xs text-red-600">PAN must be exactly 9 digits.</p>
                            )}
                        </div>
                    );
                })}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">
                        हस्ताक्षर/स्टाम्प फोटो
                    </label>

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
            </div>
        </div>
    );
};

export default LetterForm;
