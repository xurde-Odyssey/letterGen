import { BIDDING_TEMPLATES } from './biddingTemplates';

const NORMAL_TEMPLATES = [
    {
        id: 'vendor-registration',
        title: 'सूची दर्ता',
        subject: 'सूची दर्ता गरी पाउँ ।',
        fields: [
            { id: 'Date', label: 'मिति', type: 'text', placeholder: '२०८०/०१/०१' },
            {
                id: 'Letter_Variant',
                label: 'नमुना छनोट (Variant)',
                type: 'select',
                defaultValue: 'नमुना १',
                options: ['नमुना १', 'नमुना २'],
            },
            {
                id: 'Addressee_Title',
                label: 'सम्बोधन (Addressee Title)',
                type: 'select',
                options: [
                    'श्रीमान् कार्यालय प्रमुख ज्यू,',
                    'श्रीमान् प्रमुख प्रशासकीय अधिकृत ज्यू,',
                    'श्रीमान् वडा अध्यक्ष ज्यू,',
                    'श्रीमान् नगर प्रमुख ज्यू,',
                    'श्रीमान् गाउँपालिका अध्यक्ष ज्यू,',
                    'श्रीमान् आयोजना प्रमुख ज्यू,',
                ],
            },
            { id: 'Office_Name', label: 'कार्यालयको नाम', type: 'text' },
            { id: 'Office_Address', label: 'कार्यालयको ठेगाना', type: 'text' },
            { id: 'Fiscal_Year', label: 'आर्थिक वर्ष', type: 'text', placeholder: '२०८०/८१', defaultValue: '२०८१/८२' },
            { id: 'Work_Item_Type', label: 'कार्य/सामानको प्रकार', type: 'text', defaultValue: 'कृषि सामग्री' },
            { id: 'Your_Name', label: 'निवेदकको नाम', type: 'text' },
            { id: 'Your_Company_Name', label: 'फर्मको नाम', type: 'text' },
            { id: 'Company_Address', label: 'फर्मको ठेगाना', type: 'text' },
            { id: 'Pan_No', label: 'पान नं.', type: 'text' },
        ],
        content: (data) => {
            const variant = data.Letter_Variant || 'नमुना १';
            const introParagraph = variant === 'नमुना २'
                ? `प्रस्तुत विषयमा तहाँ कार्यालयको आ.व. ${data.Fiscal_Year || '२०८१/८२'} को लागि आवश्यक ${data.Work_Item_Type || '[कार्य/सामान आपूर्ति]'} सम्बन्धी आपूर्ति कार्यमा सहभागी हुन इच्छुक भएकोले आवश्यक कागजातसहित सूची दर्ता गरिदिनुहुन यो निवेदन पेश गरेको छु।`
                : `उपरोक्त विषयमा त्यस कार्यालयको आ.व. ${data.Fiscal_Year || '२०८१/८२'} को लागि आवश्यक पर्ने ${data.Work_Item_Type || '[कार्य/सामान आपूर्ति]'} सामान आपूर्ति गर्न इच्छुक भएकाले हाम्रो फर्मको आवश्यक कागजातहरु यसै पत्रसाथ संलग्न राखी सूची दर्ताको लागि निवेदन पेश गरेका छौँ।`;

            return `
महोदय,

${introParagraph}

फर्मको नामः ${data.Your_Company_Name || ''}
ठेगानाः ${data.Company_Address || ''}
पान नंः ${data.Pan_No || ''}
    `;
        }
    },
    {
        id: 'payment-request',
        title: 'भुक्तानी सम्बन्धमा',
        subject: 'भुक्तानी सम्बन्धमा ।',
        fields: [
            { id: 'Date', label: 'मिति', type: 'text' },
            {
                id: 'Letter_Variant',
                label: 'नमुना छनोट (Variant)',
                type: 'select',
                defaultValue: 'नमुना १',
                options: ['नमुना १', 'नमुना २'],
            },
            {
                id: 'Addressee_Title',
                label: 'सम्बोधन (Addressee Title)',
                type: 'select',
                options: [
                    'श्रीमान् कार्यालय प्रमुख ज्यू,',
                    'श्रीमान् प्रमुख प्रशासकीय अधिकृत ज्यू,',
                    'श्रीमान् वडा अध्यक्ष ज्यू,',
                    'श्रीमान् नगर प्रमुख ज्यू,',
                    'श्रीमान् गाउँपालिका अध्यक्ष ज्यू,',
                    'श्रीमान् आयोजना प्रमुख ज्यू,',
                ],
            },
            { id: 'Office_Name', label: 'कार्यालयको नाम', type: 'text' },
            { id: 'Office_Address', label: 'कार्यालयको ठेगाना', type: 'text' },
            {
                id: 'Product_or_Service_Name',
                label: 'सामान/सेवाको नाम',
                type: 'text',
                suggestions: [
                    'ध्वनि यन्त्र',
                    'सेमेन्ट ब्रेन्च (फलैचा) ',
                    'बायो-स्यान्ड फिल्टर',
                    'कृषि हलो (Bed Maker)',
                    'कृषि सामग्री आपूर्ति',
                ],
            },
            { id: 'Amount', label: 'रकम अंकमा', type: 'text', placeholder: '१०५०० /-' },
            { id: 'Amount_In_Words', label: 'रकम अक्षरमा', type: 'text', placeholder: 'दस हजार पाँच सय रुपैंया मात्र /-' },
            { id: 'Your_Name', label: 'निवेदकको नाम', type: 'text' },
            { id: 'Your_Company_Name', label: 'फर्मको नाम', type: 'text' },
            { id: 'Company_Address', label: 'फर्मको ठेगाना', type: 'text' },
        ],
        content: (data) => {
            const variant = data.Letter_Variant || 'नमुना १';
            if (variant === 'नमुना २') {
                return `
महोदय,

प्रस्तुत विषयमा त्यस कार्यालयको खरिद आदेश बमोजिम "${data.Product_or_Service_Name || '[सामान/सेवाको नाम]'}" आपूर्ति तथा जडान सम्बन्धी कार्य यस फर्मबाट नियमानुसार सम्पन्न भइसकेको जानकारी गराउँदछु।

सम्बन्धित बिल, विवरण तथा आवश्यक कागजात कार्यालयमा बुझाइसकिएको हुँदा देय रकम रु. ${data.Amount || '[रकम अंकमा]'} (${data.Amount_In_Words || '[रकम अक्षरमा]'}) यथाशीघ्र भुक्तानी गरिदिनुहुन विनम्र अनुरोध गर्दछु।
    `;
            }

            return `
महोदय,

उपरोक्त विषयमा त्यस कार्यालय र हाम्रो फर्म बीच भएको खरिद आदेश अनुसार "${data.Product_or_Service_Name || '[सामान/सेवाको नाम]'}" आपूर्ति तथा जडान गर्ने कार्य सफलतापूर्वक सम्पन्न भइसकेको व्यहोरा अवगत नै छ।

सो कार्य सम्पन्न भई आधिकारिक बिल कार्यालयमा पेश गरिसकिएको छ। अतः उक्त बिल बमोजिमको रकम रु. ${data.Amount || '[रकम अंकमा]'} (${data.Amount_In_Words || '[रकम अक्षरमा]'}) नियमअनुसार यथाशीघ्र भुक्तानी गरिदिनुहुनका लागि यो निवेदन पेश गर्दछु।
    `;
        }
    },
    {
        id: 'deadline-extension',
        title: 'म्याद थप',
        subject: 'म्याद थप गरिपाउँ ।',
        fields: [
            { id: 'Date', label: 'मिति', type: 'text' },
            {
                id: 'Letter_Variant',
                label: 'नमुना छनोट (Variant)',
                type: 'select',
                defaultValue: 'नमुना १',
                options: ['नमुना १', 'नमुना २'],
            },
            {
                id: 'Addressee_Title',
                label: 'सम्बोधन (Addressee Title)',
                type: 'select',
                options: [
                    'श्रीमान् कार्यालय प्रमुख ज्यू,',
                    'श्रीमान् प्रमुख प्रशासकीय अधिकृत ज्यू,',
                    'श्रीमान् वडा अध्यक्ष ज्यू,',
                    'श्रीमान् नगर प्रमुख ज्यू,',
                    'श्रीमान् गाउँपालिका अध्यक्ष ज्यू,',
                    'श्रीमान् आयोजना प्रमुख ज्यू,',
                ],
            },
            { id: 'Office_Name', label: 'कार्यालयको नाम', type: 'text' },
            { id: 'Office_Address', label: 'कार्यालयको ठेगाना', type: 'text' },
            { id: 'Project_Name', label: 'आयोजनाको नाम', type: 'text' },
            { id: 'Tender_No', label: 'ठेक्का नं.', type: 'text' },
            { id: 'Reason_for_Delay', label: 'ढिलाइको कारण', type: 'textarea' },
            { id: 'Extra_Days', label: 'थप दिन', type: 'number' },
            { id: 'Your_Name', label: 'निवेदकको नाम', type: 'text' },
            { id: 'Your_Company_Name', label: 'फर्मको नाम', type: 'text' },
        ],
        content: (data) => {
            const variant = data.Letter_Variant || 'नमुना १';
            if (variant === 'नमुना २') {
                return `
महोदय,

प्रस्तुत विषयमा ${data.Project_Name || '[आयोजनाको नाम]'} (ठेक्का नं: ${data.Tender_No || '[ठेक्का नं]'}) को कार्य यस फर्ममार्फत सम्पन्न गरिने क्रममा ${data.Reason_for_Delay || '[ढिलाइको कारण]'} का कारण निर्धारित म्यादभित्र कार्य सम्पन्न हुन नसकेको व्यहोरा अवगत गराउँदछु।

यस कारणले उक्त कार्य पूर्णता दिन थप ${data.Extra_Days || '[थप दिन]'} दिन म्याद थप गरिदिनुहुन हार्दिक अनुरोध गर्दछु।
    `;
            }

            return `
महोदय,

उपरोक्त विषयमा त्यस कार्यालय र यस फर्म बिच ${data.Project_Name || '[आयोजनाको नाम]'} (ठेक्का नं: ${data.Tender_No || '[ठेक्का नं]'}) निर्माण/आपूर्ति गर्ने सम्झौता भएकोमा, ${data.Reason_for_Delay || '[ढिलाइको कारण]'} को कारणले तोकिएको समयमा कार्य सम्पन्न गर्न नसकिएको हुँदा, उक्त कार्य सम्पन्न गर्न थप ${data.Extra_Days || '[थप दिन]'} दिनको म्याद थप गरिदिनुहुन विनम्र अनुरोध गर्दछु।
    `;
        }
    },
    {
        id: 'refund-deposit',
        title: 'कार्य सम्पन्न धरौटी रकम फिर्ता पाउँ',
        subject: 'धरौटी रकम फिर्ता गरिपाऊँ।',
        fields: [
            { id: 'Date', label: 'मिति', type: 'text' },
            {
                id: 'Addressee_Title',
                label: 'सम्बोधन (Addressee Title)',
                type: 'select',
                options: [
                    'श्रीमान् कार्यालय प्रमुख ज्यू,',
                    'श्रीमान् प्रमुख प्रशासकीय अधिकृत ज्यू,',
                    'श्रीमान् वडा अध्यक्ष ज्यू,',
                    'श्रीमान् नगर प्रमुख ज्यू,',
                    'श्रीमान् गाउँपालिका अध्यक्ष ज्यू,',
                    'श्रीमान् आयोजना प्रमुख ज्यू,',
                ],
            },
            { id: 'Office_Name', label: 'कार्यालयको नाम', type: 'text' },
            { id: 'Office_Address', label: 'कार्यालयको ठेगाना', type: 'text' },
            { id: 'Work_Detail', label: 'कामको विवरण', type: 'text' },
            { id: 'Tender_No', label: 'Tender Number / ठेक्का नं.', type: 'text' },
            { id: 'Completion_Date', label: 'कार्य सम्पन्न भएको मिति / Completion Date', type: 'text' },
            { id: 'Your_Name', label: 'तपाईंको नाम', type: 'text' },
            { id: 'Your_Company_Name', label: 'कम्पनीको नाम', type: 'text' },
        ],
        content: (data) => `
महोदय,

उपरोक्त विषयमा त्यस कार्यालय अन्तर्गतको ${data.Work_Detail || '[कामको विवरण]'} (ठेक्का नं: ${data.Tender_No || '[Tender Number]'}) निर्माण कार्य यस कम्पनीले मिति ${data.Completion_Date || '[कार्य सम्पन्न भएको मिति / Completion Date]'} मा सफलतापूर्वक सम्पन्न गरिसकेको व्यहोरा अवगत नै छ।

उक्त कार्यको त्रुटि सच्याउने अवधि (Defect Liability Period) पनि समाप्त भइसकेको र सो अवधिमा कुनै पनि त्रुटि नदेखिएकोले, हाम्रो बिलबाट कट्टी भई त्यस कार्यालयको धरौटी खातामा जम्मा भएको धरौटी रकम (Retention Money) फिर्ता गरिदिनुहुन अनुरोध गर्दछु।


    `,
    },
    {
        id: 'work-completion-recommendation',
        title: 'कार्य सम्पन्नको सिफारिस सम्बन्धमा',
        subject: 'कार्य सम्पन्नको सिफारिस सम्बन्धमा ।',
        fields: [
            { id: 'Date', label: 'मिति', type: 'text' },
            {
                id: 'Addressee_Title',
                label: 'सम्बोधन (Addressee Title)',
                type: 'select',
                options: [
                    'श्रीमान् कार्यालय प्रमुख ज्यू,',
                    'श्रीमान् प्रमुख प्रशासकीय अधिकृत ज्यू,',
                    'श्रीमान् वडा अध्यक्ष ज्यू,',
                    'श्रीमान् नगर प्रमुख ज्यू,',
                    'श्रीमान् गाउँपालिका अध्यक्ष ज्यू,',
                    'श्रीमान् आयोजना प्रमुख ज्यू,',
                ],
            },
            { id: 'Office_Name', label: 'कार्यालयको नाम', type: 'text' },
            { id: 'Office_Address', label: 'कार्यालयको ठेगाना', type: 'text' },
            { id: 'Fiscal_Year', label: 'आर्थिक वर्ष', type: 'text', placeholder: '२०८१/८२' },
            { id: 'Work_Name', label: 'कार्य/योजनाको नाम', type: 'text', placeholder: 'what work' },
            { id: 'Work_Place', label: 'कार्य स्थान', type: 'text', placeholder: 'place' },
            { id: 'Tender_No', label: 'ठेक्का नं.', type: 'text' },
            { id: 'Your_Name', label: 'निवेदकको नाम', type: 'text' },
            { id: 'Your_Company_Name', label: 'फर्मको नाम', type: 'text' },
            { id: 'Company_Address', label: 'फर्मको ठेगाना', type: 'text' },
        ],
        content: (data) => `
महोदय,

उपरोक्त सम्बन्धमा यस आ.व. ${data.Fiscal_Year || '[ ]'} को योजना ${data.Work_Name || '[ what work ]'}, ${data.Work_Place || '[ place ]'} ठेक्का न :${data.Tender_No || '[  ]'} को सम्पूर्ण कार्य सम्पन्न भएको हुदा अनुगमन गरि कार्य सम्पन्नको सिफारिस गरिदिनु हुन अनुरोध गर्दछु ।
    `,
    },
    {
        id: 'bid-security-refund-not-awarded',
        title: 'बोलपत्र स्वीकृत नभएको अवस्थामा धरौटी फिर्ता',
        subject: 'बोलपत्रको धरौटी (Bid Security) रकम फिर्ता गरिपाऊँ।',
        fields: [
            { id: 'Date', label: 'मिति', type: 'text' },
            {
                id: 'Addressee_Title',
                label: 'सम्बोधन (Addressee Title)',
                type: 'select',
                options: [
                    'श्रीमान् कार्यालय प्रमुख ज्यू,',
                    'श्रीमान् प्रमुख प्रशासकीय अधिकृत ज्यू,',
                    'श्रीमान् वडा अध्यक्ष ज्यू,',
                    'श्रीमान् नगर प्रमुख ज्यू,',
                    'श्रीमान् गाउँपालिका अध्यक्ष ज्यू,',
                    'श्रीमान् आयोजना प्रमुख ज्यू,',
                ],
            },
            { id: 'Office_Name', label: 'कार्यालयको नाम', type: 'text' },
            { id: 'Office_Address', label: 'कार्यालयको ठेगाना', type: 'text' },
            { id: 'Notice_Date', label: 'सूचना प्रकाशित मिति / Notice Date', type: 'text' },
            { id: 'Work_Name', label: 'कामको विवरण वा ठेक्काको नाम / Name of Work', type: 'text' },
            { id: 'Tender_No', label: 'Tender Number / ठेक्का नं.', type: 'text' },
            { id: 'Your_Company_Name', label: 'तपाईंको कम्पनीको नाम / Your Company Name', type: 'text' },
            { id: 'Bank_Name', label: 'Bank Name', type: 'text' },
            { id: 'Deposit_Date', label: 'रकम जम्मा गरेको मिति / Deposit Date', type: 'text' },
            { id: 'Amount', label: 'रकम अङ्कमा / Amount in numbers', type: 'text' },
            { id: 'Amount_In_Words', label: 'रकम अक्षरमा / Amount in words', type: 'text' },
            { id: 'Your_Name', label: 'निवेदकको नाम', type: 'text' },
            { id: 'Company_Address', label: 'कम्पनीको ठेगाना', type: 'text' },
        ],
        content: (data) => `
महोदय,

उपरोक्त विषयमा त्यस कार्यालयद्वारा मिति ${data.Notice_Date || '[सूचना प्रकाशित मिति / Notice Date]'} मा प्रकाशित सूचना अनुसार ${data.Work_Name || '[कामको विवरण वा ठेक्काको नाम / Name of Work]'} (ठेक्का नं: ${data.Tender_No || '[Tender Number]'}) कार्यको लागि यस ${data.Your_Company_Name || '[तपाईंको कम्पनीको नाम / Your Company Name]'} ले पनि बोलपत्र पेस गरेको व्यहोरा अवगत नै छ।

उक्त बोलपत्रको मूल्याङ्कन हुँदा यस कम्पनीको बोलपत्र स्वीकृत नभएको हुनाले, बोलपत्र पेस गर्दा हामीले त्यस कार्यालयको ${data.Bank_Name || '[bank name]'} बैंकको धरौटी खातामा मिति ${data.Deposit_Date || '[रकम जम्मा गरेको मिति / Deposit Date]'} मा जम्मा गरेको रु. ${data.Amount || '[रकम अङ्कमा / Amount in numbers]'} (अक्षरेपी ${data.Amount_In_Words || '[रकम अक्षरमा / Amount in words]'}) धरौटी रकम यस कम्पनीको बैंक खातामा फिर्ता गरिदिनुहुन अनुरोध गर्दछु।

संलग्न कागजातहरू:
१. धरौटी जम्मा गरेको बैंक भौचरको सक्कल प्रति ।
२. बोलपत्र खरिद गरेको रसिदको प्रतिलिपि।

    `,
    },
    {
        id: 'plan-agreement-request',
        title: 'योजना सम्झौता गरी पाउ',
        subject: 'योजना सम्झौता गरी पाउ ।',
        fields: [
            { id: 'Date', label: 'मिति', type: 'text' },
            {
                id: 'Addressee_Title',
                label: 'सम्बोधन (Addressee Title)',
                type: 'select',
                options: [
                    'श्रीमान् कार्यालय प्रमुख ज्यू,',
                    'श्रीमान् प्रमुख प्रशासकीय अधिकृत ज्यू,',
                    'श्रीमान् वडा अध्यक्ष ज्यू,',
                    'श्रीमान् नगर प्रमुख ज्यू,',
                    'श्रीमान् गाउँपालिका अध्यक्ष ज्यू,',
                    'श्रीमान् आयोजना प्रमुख ज्यू,',
                ],
            },
            { id: 'Office_Name', label: 'कार्यालयको नाम', type: 'text' },
            { id: 'Office_Address', label: 'कार्यालयको ठेगाना', type: 'text' },
            { id: 'Fiscal_Year', label: 'आर्थिक वर्ष', type: 'text', placeholder: '२०८१/८२' },
            { id: 'Work_Name', label: 'कार्य/योजनाको नाम', type: 'text', placeholder: 'what work' },
            { id: 'Work_Place', label: 'कार्य स्थान', type: 'text', placeholder: 'place' },
            { id: 'Tender_No', label: 'ठेक्का नं.', type: 'text' },
            { id: 'Your_Name', label: 'निवेदकको नाम', type: 'text' },
            { id: 'Your_Company_Name', label: 'फर्मको नाम', type: 'text' },
            { id: 'Company_Address', label: 'फर्मको ठेगाना', type: 'text' },
        ],
        content: (data) => `
महोदय,

उपरोक्त सम्बन्धमा यस आ.व. ${data.Fiscal_Year || '[ ]'} को योजना ${data.Work_Name || '[ what work ]'}, ${data.Work_Place || '[ place ]'} ठेक्का न :${data.Tender_No || '[  ]'} को योजना  सम्झौता गरिदिनुहुन अनुरोध गर्दछौ ।
    `,
    },
    {
        id: 'cement-bench-quotation',
        title: 'कोटेसन सम्बन्धमा',
        subject: 'कोटेसन सम्बन्धमा ।',
        fields: [
            { id: 'Date', label: 'मिति', type: 'text', placeholder: '२०८०/०१/०१' },
            {
                id: 'Letter_Variant',
                label: 'नमुना छनोट (Variant)',
                type: 'select',
                defaultValue: 'नमुना १',
                options: ['नमुना १', 'नमुना २'],
            },
            {
                id: 'Addressee_Title',
                label: 'सम्बोधन (Addressee Title)',
                type: 'select',
                options: [
                    'श्रीमान् कार्यालय प्रमुख ज्यू,',
                    'श्रीमान् प्रमुख प्रशासकीय अधिकृत ज्यू,',
                    'श्रीमान् वडा अध्यक्ष ज्यू,',
                    'श्रीमान् नगर प्रमुख ज्यू,',
                    'श्रीमान् गाउँपालिका अध्यक्ष ज्यू,',
                    'श्रीमान् आयोजना प्रमुख ज्यू,',
                ],
            },
            { id: 'Office_Name', label: 'कार्यालयको नाम', type: 'text' },
            { id: 'Office_Address', label: 'कार्यालयको ठेगाना', type: 'text' },
            { id: 'Office_Type', label: 'कार्यालयको प्रकार', type: 'text', placeholder: 'जनता, सरकारी, आदि', defaultValue: 'नगरपालिका' },
            { id: 'Product_List', label: 'उत्पादन सूची (Product List)', type: 'product-list' },
            { id: 'Your_Name', label: 'निवेदक/आपूर्तिकर्ताको नाम', type: 'text' },
            { id: 'Your_Company_Name', label: 'कम्पनी/फर्मको नाम', type: 'text' },
            { id: 'Company_Address', label: 'कम्पनीको ठेगाना', type: 'text' },
        ],
        content: (data) => {
            const variant = data.Letter_Variant || 'नमुना १';
            const productList = Array.isArray(data.Product_List) ? data.Product_List : [];
            const validProducts = productList.filter(
                (item) => item && (item.Product_Name || item.Price_Number || item.Price_Words)
            );

            const productNameList = validProducts.length > 0
                ? validProducts
                    .map((item) => item.Product_Name || '[Product_Name]')
                    .join(', ')
                : '[Product_Name, Product_Name]';

            const dynamicPricingSentences = validProducts.length > 0
                ? validProducts.map((item, index) => {
                    const suffix = index === validProducts.length - 1 ? 'रहेको जानकारी गराउँदछु।' : 'र';
                    return `उक्त ${item.Product_Name || '[Product_Name]'} को डेलिभरी, भ्याट तथा फिटिङ्ग सहित बजार मूल्य रु ${item.Price_Number || '[Price_Number]'}/- (${item.Price_Words || '[Price_Words]'}) ${suffix}`;
                }).join(' ')
                : 'उक्त [Product_Name] को डेलिभरी, भ्याट तथा फिटिङ्ग सहित बजार मूल्य रु [Price_Number]/- ([Price_Words]) रहेको जानकारी गराउँदछु।';

            if (variant === 'नमुना २') {
                return `
महोदय,

उपरोक्त विषयमा यस ${data.Office_Type || '[Office_Type]'} को क्षेत्रको आवश्यकता अनुसार स्थानीय उद्योगबाट उत्पादित ${productNameList} आपूर्ति गर्न सकिने जानकारी गराउँदछु। यी सामग्री प्रयोगले सेवा प्रवाह सहज, वातावरणमैत्री तथा लागत नियन्त्रणमा सहयोग पुग्ने विश्वास लिएको छु।

${dynamicPricingSentences}

उक्त सामग्री तोकिएको समयभित्र गुणस्तरीय रूपमा उपलब्ध गराउन हामी प्रतिबद्ध रहनेछौँ।`;
            }

            return `
महोदय,

प्रस्तुत विषयमा यस ${data.Office_Type || '[Office_Type]'} का सार्वजनिक क्षेत्रलाई व्यवस्थित तथा वातावरणमैत्री बनाउन नगरबासीको हितका लागि स्थानीय उद्योगबाट उत्पादित ${productNameList} बजारमा उपलब्ध गराएको जानकारी गर्दछु। स्थानीय उत्पादनको प्रयोगले रोजगारी प्रवर्द्धन तथा लागत प्रभावकारी सेवा प्रदान हुने विश्वास लिएको छु।

${dynamicPricingSentences}

मौका प्रदान गर्नु भएमा तोकिएको सेवा गुणस्तरीय रूपमा प्रदान गर्न प्रतिबद्ध रहनेछु।`;
        }
    },
    {
        id: 'market-price-quotation',
        title: 'बजार मूल्य पेस',
        subject: 'बजार मूल्य पेस गरिएको बारे ।',
        fields: [
            { id: 'Date', label: 'मिति', type: 'text', placeholder: '२०८०/०१/०१' },
            {
                id: 'Letter_Variant',
                label: 'नमुना छनोट (Variant)',
                type: 'select',
                defaultValue: 'नमुना १',
                options: ['नमुना १', 'नमुना २'],
            },
            {
                id: 'Addressee_Title',
                label: 'सम्बोधन (Addressee Title)',
                type: 'select',
                options: [
                    'श्रीमान् कार्यालय प्रमुख ज्यू,',
                    'श्रीमान् प्रमुख प्रशासकीय अधिकृत ज्यू,',
                    'श्रीमान् वडा अध्यक्ष ज्यू,',
                    'श्रीमान् नगर प्रमुख ज्यू,',
                    'श्रीमान् गाउँपालिका अध्यक्ष ज्यू,',
                    'श्रीमान् आयोजना प्रमुख ज्यू,',
                ],
            },
            { id: 'Office_Name', label: 'कार्यालयको नाम', type: 'text' },
            { id: 'Office_Address', label: 'कार्यालयको ठेगाना', type: 'text' },
            { id: 'Notice_Number', label: 'पत्र/सूचना नं.', type: 'text' },
            { id: 'Notice_Date', label: 'पत्रको मिति', type: 'text', placeholder: '२०८०/०१/०१' },
            { id: 'Product_Name', label: 'सामानको नाम', type: 'text' },
            { id: 'Unit', label: 'इकाई', type: 'text', placeholder: 'के.जी., कि.ग्रा., टन, आदि' },
            { id: 'Rate_Amount', label: 'दर (रु.)', type: 'text' },
            { id: 'Your_Name', label: 'निवेदकको नाम', type: 'text' },
            { id: 'Your_Company_Name', label: 'कम्पनी/फर्मको नाम', type: 'text' },
            { id: 'Company_Address', label: 'कम्पनीको ठेगाना', type: 'text' },
        ],
        content: (data) => {
            const variant = data.Letter_Variant || 'नमुना १';
            if (variant === 'नमुना २') {
                return `
महोदय,

प्रस्तुत विषयमा तहाँ कार्यालयको पत्र/सूचना नं. ${data.Notice_Number || '[पत्र नं.]'} मिति ${data.Notice_Date || '[मिति]'} बमोजिम ${data.Product_Name || '[सामानको नाम]'} को प्रचलित बजार दर सम्बन्धी विवरण पेस गरिएको व्यहोरा जानकारी गराउँदछु।

उक्त सामग्रीको इकाई ${data.Unit || '[इकाई]'} अनुसार ढुवानी तथा भ्याट सहित दर उल्लेख गरी बजार मूल्य विवरण तालिकामा प्रस्तुत गरिएको छ।`;
            }

            return `
महोदय,

प्रस्तुत विषयमा तहाँ कार्यालयको पत्र/सूचना नं. ${data.Notice_Number || '[पत्र नं.]'} मिति ${data.Notice_Date || '[मिति]'} गतेको पत्रमा ${data.Product_Name || '[सामानको नाम]'} को हालको बजार मूल्य माग गरिएको हुँदा निम्न तालिका अनुसार बजार मूल्य पेस गरिएको व्यहोरा जानकारी गर्दछु।`;
        }
    }
];

export const TEMPLATES = [...NORMAL_TEMPLATES, ...BIDDING_TEMPLATES];

export default TEMPLATES;
