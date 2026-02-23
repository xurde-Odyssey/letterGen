import React from 'react';

const LetterPreview = React.forwardRef(({ template, data, letterpadImage }, ref) => {
    if (!template) return null;
    const isMarketPriceQuotation = template.id === 'market-price-quotation';

    return (
        <div className="flex-1 bg-slate-200 p-4 md:p-8 overflow-y-auto h-screen print:h-auto print:bg-white print:p-0">
            <div
                ref={ref}
                className="a4-container shadow-xl mx-auto bg-white flex flex-col relative"
                style={{
                    width: '210mm',
                    height: '297mm',
                    paddingTop: '5.72cm',
                    paddingBottom: '1.57cm',
                    paddingLeft: '2.54cm',
                    paddingRight: '2.54cm',
                    margin: '0 auto',
                    fontFamily: 'Noto Sans Nepali, Arial',
                    fontSize: '12pt',
                    lineHeight: '1.6',
                    boxSizing: 'border-box',
                }}
            >
                {letterpadImage && (
                    <img
                        src={letterpadImage}
                        alt="Letterpad"
                        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                        style={{
                            width: '20cm',
                            height: '5.49cm',
                            objectFit: 'fill',
                        }}
                    />
                )}

                {/* Date Row (optional) */}
                {String(data.Date || '').trim() && (
                    <div className="flex justify-end mb-6 text-[12pt]">
                        <p>मिति: {data.Date}</p>
                    </div>
                )}

                {/* Recipient Details */}
                <div className="mb-6 text-[12pt] space-y-1">
                    <p>{data.Addressee_Title || 'श्रीमान् कार्यालय प्रमुख ज्यू,'}</p>
                    <p>{data.Office_Name || '................................................'}</p>
                    <p>{data.Office_Address || '................................................'} ।</p>
                </div>

                {/* Subject */}
                <div className="text-center mb-6 font-bold text-[12pt] underline decoration-skip-ink">
                    विषय: {template.subject}
                </div>

                {/* Content */}
                <div className="letter-content flex-grow whitespace-pre-line text-justify text-[12pt]">
                    {template.content(data)}
                </div>

                {isMarketPriceQuotation && (
                    <div className="mb-6 text-[12pt]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border border-slate-900 p-2 text-left font-semibold">क्र.स.</th>
                                    <th className="border border-slate-900 p-2 text-left font-semibold">विवरण</th>
                                    <th className="border border-slate-900 p-2 text-left font-semibold">इकाई</th>
                                    <th className="border border-slate-900 p-2 text-left font-semibold">ढुवानी तथा भ्याट सहित दर (रु)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-slate-900 p-2">१</td>
                                    <td className="border border-slate-900 p-2">{data.Product_Name || '[सामानको नाम]'}</td>
                                    <td className="border border-slate-900 p-2">{data.Unit || '[इकाई]'}</td>
                                    <td className="border border-slate-900 p-2">{data.Rate_Amount || '[दर]'} /-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bottom-right signature/stamp block */}
                <div className="mt-12 flex justify-end" style={{ marginRight: '-0.35cm' }}>
                    <div className="w-[7.5cm] text-center text-[12pt]">
                        <div
                            className="mb-4 text-slate-400 text-xs flex items-end justify-center"
                            style={{ width: '6.5cm', height: '4.2cm' }}
                        >
                            {data.Signature_Stamp_Image ? (
                                <img
                                    src={data.Signature_Stamp_Image}
                                    alt="Signature or stamp"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                '[हस्ताक्षर/स्टाम्प]'
                            )}
                        </div>
                        <p
                            className="font-semibold border-b-2 border-slate-900 inline-block pb-0.5 mb-0"
                            style={{ marginRight: '-3cm' }}
                        >
                            निवेदक
                        </p>
                        <div className="space-y-1 mt-0" style={{ marginRight: '-3cm' }}>
                            <p className="font-bold">{data.Your_Name || '..........................'}</p>
                            <p>{data.Your_Company_Name || '................................................'}</p>
                            <p>{data.Company_Address || '................................................'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

LetterPreview.displayName = 'LetterPreview';

export default LetterPreview;
