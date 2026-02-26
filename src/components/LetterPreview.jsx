import React from 'react';

const LetterPreview = React.forwardRef(({ template, data, letterpadImage }, ref) => {
    if (!template) return null;
    const isMarketPriceQuotation = template.id === 'market-price-quotation';
    const isBiddingTemplate = template.group === 'bidding';
    const hasSecondPage = typeof template.secondPageContent === 'function';
    const hasThirdPage = typeof template.thirdPageContent === 'function';
    const showTopDateRow = template.showTopDateRow !== false;
    const showRecipientDetails = template.showRecipientDetails !== false;
    const showSignatureBlock = template.showSignatureBlock !== false;
    const showSubject = template.showSubject !== false;
    const dateLabel = template.dateLabel || 'मिति';
    const subjectPrefix = Object.prototype.hasOwnProperty.call(template, 'subjectPrefix')
        ? template.subjectPrefix
        : 'विषय:';
    const signaturePlacement = data.Signature_Block_Placement || 'right';
    const signaturePlacementMap = {
        right: { containerClass: 'justify-end', textAlign: 'right', marginRight: '0.35cm', marginTop: '1.75rem' },
        'up-right': { containerClass: 'justify-end', textAlign: 'right', marginRight: '0.35cm', marginTop: '0.75rem' },
        'down-right': { containerClass: 'justify-end', textAlign: 'right', marginRight: '0.35cm', marginTop: '2.5rem' },
        left: { containerClass: 'justify-start', textAlign: 'left', marginLeft: '0.35cm', marginTop: '1.75rem' },
        'up-left': { containerClass: 'justify-start', textAlign: 'left', marginLeft: '0.35cm', marginTop: '0.75rem' },
        'down-left': { containerClass: 'justify-start', textAlign: 'left', marginLeft: '0.35cm', marginTop: '2.5rem' },
    };
    const signatureLayout = signaturePlacementMap[signaturePlacement] || signaturePlacementMap.right;
    const renderFormValue = (value, fallback = '') => (
        value
            ? (isBiddingTemplate ? <span className="font-bold">{value}</span> : value)
            : fallback
    );
    const renderTemplatedContent = (content) => {
        if (!isBiddingTemplate) return content;

        const parts = String(content).split(/(\[\[B\]\][\s\S]*?\[\[\/B\]\]|\[\[SIGNATURE\]\]|\[\[LETTER_TITLE\]\]|\[\[SELF_DECLARATION_TITLE\]\])/g);
        return parts.map((part, index) => {
            if (part === '[[LETTER_TITLE]]') {
                return (
                    <div key={index} className="text-center font-bold underline my-2">
                        Letter of Bid
                    </div>
                );
            }
            if (part === '[[SELF_DECLARATION_TITLE]]') {
                return (
                    <div key={index} className="text-center font-bold underline my-2">
                        Self Declaration
                    </div>
                );
            }
            if (part === '[[SIGNATURE]]') {
                return (
                    <React.Fragment key={index}>
                        {data.Signature_Stamp_Image ? (
                            <img
                                src={data.Signature_Stamp_Image}
                                alt="Signed signature"
                                className="h-20 w-30 object-contain inline-block align-middle ml-3"
                            />
                        ) : (
                            <span className="inline-block align-middle ml-3">..........................</span>
                        )}
                    </React.Fragment>
                );
            }
            const match = part.match(/^\[\[B\]\]([\s\S]*?)\[\[\/B\]\]$/);
            if (!match) return <React.Fragment key={index}>{part}</React.Fragment>;
            return <strong key={index}>{match[1]}</strong>;
        });
    };
    const bidContentTypographyClass = isBiddingTemplate ? 'text-[11pt]' : 'text-[12pt]';
    const bidContentLineHeight = isBiddingTemplate ? '1' : undefined;

    return (
        <div className="flex-1 bg-slate-200 p-4 md:p-8 overflow-y-auto h-screen print:h-auto print:bg-white print:p-0">
            <div
                ref={ref}
                className="space-y-6 print:space-y-0"
            >
                <div
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
                    {showTopDateRow && String(data.Date || '').trim() && (
                        <div className="flex justify-end mb-6 text-[12pt]">
                            <p>
                                {isBiddingTemplate ? <span className="font-bold">{dateLabel}:</span> : `${dateLabel}:`} {renderFormValue(data.Date, '')}
                            </p>
                        </div>
                    )}

                    {/* Recipient Details */}
                    {showRecipientDetails && (
                        <div className="mb-6 text-[12pt] space-y-1">
                            <p>{renderFormValue(data.Addressee_Title, 'श्रीमान् कार्यालय प्रमुख ज्यू,')}</p>
                            <p>{renderFormValue(data.Office_Name, '................................................')}</p>
                            <p>{renderFormValue(data.Office_Address, '................................................')} ।</p>
                        </div>
                    )}

                    {/* Subject */}
                    {showSubject && (
                        <div className="text-center mb-6 font-bold text-[12pt] underline decoration-skip-ink">
                            {subjectPrefix ? `${subjectPrefix} ${template.subject}` : template.subject}
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className={`letter-content flex-grow whitespace-pre-line text-justify ${bidContentTypographyClass}`}
                        style={{ lineHeight: bidContentLineHeight }}
                    >
                        {renderTemplatedContent(template.content(data))}
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
                    {showSignatureBlock && (
                        <div
                            className={`flex ${signatureLayout.containerClass}`}
                            style={{
                                marginTop: signatureLayout.marginTop,
                                marginRight: signatureLayout.marginRight || undefined,
                                marginLeft: signatureLayout.marginLeft || undefined,
                            }}
                        >
                            <div className="w-[7.2cm] text-[12pt]" style={{ textAlign: signatureLayout.textAlign }}>
                                <div
                                    className={`mb-3 text-slate-400 text-xs flex items-end ${signatureLayout.textAlign === 'right' ? 'justify-end ml-auto' : 'justify-start'}`}
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
                                <p className="font-semibold border-b-2 border-slate-900 inline-block pb-0.5 mb-0">
                                    निवेदक
                                </p>
                                <div className="space-y-1 mt-0">
                                    <p className="font-bold">{data.Your_Name || '..........................'}</p>
                                    <p>{data.Your_Company_Name || '................................................'}</p>
                                    <p>{data.Company_Address || '................................................'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {data.Stamp_Image && (
                        <img
                            src={data.Stamp_Image}
                            alt="Bottom stamp"
                            className="absolute pointer-events-none"
                            style={{
                                left: '50%',
                                transform: 'translateX(-50%)',
                                bottom: '1.2cm',
                                width: '3.6cm',
                                height: '3.6cm',
                                objectFit: 'contain',
                            }}
                        />
                    )}
                </div>

                {hasSecondPage && (
                    <>
                        <div className="no-print mx-auto w-[210mm] flex items-center gap-3 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-500">
                            <div className="h-px bg-slate-300 flex-1" />
                            <span>Page Break</span>
                            <div className="h-px bg-slate-300 flex-1" />
                        </div>
                        <div
                            className="a4-container shadow-xl mx-auto bg-white flex flex-col relative print:break-before-page"
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
                            <div
                                className={`letter-content flex-grow whitespace-pre-line text-justify ${bidContentTypographyClass}`}
                                style={{ lineHeight: bidContentLineHeight }}
                            >
                                {renderTemplatedContent(template.secondPageContent(data))}
                            </div>

                            {data.Stamp_Image && (
                                <img
                                    src={data.Stamp_Image}
                                    alt="Bottom stamp"
                                    className="absolute pointer-events-none"
                                    style={{
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        bottom: '1.2cm',
                                        width: '3.6cm',
                                        height: '3.6cm',
                                        objectFit: 'contain',
                                    }}
                                />
                            )}
                        </div>
                    </>
                )}

                {hasThirdPage && (
                    <>
                        <div className="no-print mx-auto w-[210mm] flex items-center gap-3 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-500">
                            <div className="h-px bg-slate-300 flex-1" />
                            <span>Page Break</span>
                            <div className="h-px bg-slate-300 flex-1" />
                        </div>
                        <div
                            className="a4-container shadow-xl mx-auto bg-white flex flex-col relative print:break-before-page"
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
                            <div
                                className={`letter-content flex-grow whitespace-pre-line text-justify ${bidContentTypographyClass}`}
                                style={{ lineHeight: bidContentLineHeight }}
                            >
                                {renderTemplatedContent(template.thirdPageContent(data))}
                            </div>

                            {data.Stamp_Image && (
                                <img
                                    src={data.Stamp_Image}
                                    alt="Bottom stamp"
                                    className="absolute pointer-events-none"
                                    style={{
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        bottom: '1.2cm',
                                        width: '3.6cm',
                                        height: '3.6cm',
                                        objectFit: 'contain',
                                    }}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

LetterPreview.displayName = 'LetterPreview';

export default LetterPreview;
