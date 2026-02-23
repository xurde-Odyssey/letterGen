import React, { useState } from 'react';
import NepaliInputWithSuggestions from './NepaliInputWithSuggestions';
import { getBestNepaliSuggestion } from '../utils/nepaliDictionary';

const NepaliConverterPreview = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const handleInputChange = (value) => {
        setInput(value);
        setOutput(value);
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
    };

    return (
        <div className="p-8 max-w-2xl mx-auto bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Nepali Unicode Converter</h1>
            <p className="text-slate-600 mb-8">Type Romanized Nepali and see it convert to Unicode in real-time</p>

            <div className="space-y-6">
                {/* Input Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                        Type Romanized Nepali
                    </label>
                    <NepaliInputWithSuggestions
                        value={input}
                        onChange={handleInputChange}
                        placeholder="mero desh nepal..."
                        isTextarea={true}
                        isNepaliMode={true}
                    />
                </div>

                {/* Output Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                        Nepali Unicode
                    </label>
                    <div className="w-full p-4 border-2 border-slate-300 rounded-lg min-h-[150px] bg-white text-base font-nepali whitespace-pre-wrap break-words text-slate-800">
                        {output || '\u200b'}
                    </div>
                </div>

                {/* Info Box */}
                {input && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">Character Count:</span> {input.length} → {output.length}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleClear}
                        className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => {
                            if (output) {
                                navigator.clipboard.writeText(output);
                                alert('Copied to clipboard!');
                            }
                        }}
                        disabled={!output}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Copy Unicode
                    </button>
                </div>

                {/* Example Conversions */}
                <div className="mt-8 p-4 bg-white rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">Example Conversions</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">namaste</span>
                            <span className="text-slate-800 font-nepali">→ {getBestNepaliSuggestion('namaste') || 'नमस्ते'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">mero</span>
                            <span className="text-slate-800 font-nepali">→ {getBestNepaliSuggestion('mero') || 'मेरो'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">kathmandu</span>
                            <span className="text-slate-800 font-nepali">→ {getBestNepaliSuggestion('kathmandu') || 'काठमाडौं'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NepaliConverterPreview;
