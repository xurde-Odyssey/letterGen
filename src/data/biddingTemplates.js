export const BIDDING_TEMPLATES = [
    {
        id: 'letter-of-bid-sq',
        group: 'bidding',
        title: 'Letter of Bid SQ',
        subject: 'Letter of Bid',
        subjectPrefix: '',
        showTopDateRow: true,
        dateLabel: 'Date',
        showSubject: false,
        showRecipientDetails: false,
        showSignatureBlock: false,
        fields: [
            { id: 'Date', label: 'Date', type: 'text' },
            { id: 'Contract_Name', label: 'Name of the contract', type: 'text' },
            { id: 'Invitation_Bid_No', label: 'Invitation for Bid No.', type: 'text' },
            { id: 'To_Designation', label: 'To - Designation', type: 'text', defaultValue: 'Chief Officer' },
            { id: 'To_Office', label: 'To - Municipality', type: 'text', defaultValue: 'Ratuwamai Municipality, Morang' },
            { id: 'To_Address', label: 'To - Address', type: 'text', defaultValue: 'Sijuwa, Morang Morang Sijuwa' },
            { id: 'Works_Title', label: 'Works title for clause (b)', type: 'text', defaultValue: 'Procurement of Bed maker (Corn)' },
            { id: 'Total_Bid_Price', label: 'Total price for clause (c)', type: 'text', defaultValue: 'As per BOQ.' },
            { id: 'Discount_Method', label: 'Discount method for clause (d)', type: 'text', defaultValue: 'As Per BOQ' },
            { id: 'Bid_Validity_Days', label: 'Bid validity (days)', type: 'number', defaultValue: '45' },
            { id: 'Contractor_Representative_Name', label: 'Contractor’s Representative Name', type: 'text', defaultValue: 'Dipak Bhandari' },
            { id: 'For_And_On_Behalf_Of', label: 'For and on behalf of', type: 'text', defaultValue: 'Dipak Suppliers' },
        ],
        content: (data) => {
            const bold = (value, fallback = '') => `[[B]]${value || fallback}[[/B]]`;
            return `
[[B]]Name of the contract:[[/B]] ${bold(data.Contract_Name)}

[[B]]Invitation for Bid No:[[/B]] ${bold(data.Invitation_Bid_No)}

[[B]]To[[/B]]
${bold(data.To_Designation, 'Chief Officer')}
${bold(data.To_Office, 'Ratuwamai Municipality, Morang')}
${bold(data.To_Address, 'Sijuwa, Morang Morang Sijuwa')}

[[LETTER_TITLE]]

Dear Sir,

We, the undersigned, declare that:

(a) We have examined and have no reservations to the Bidding Documents.

(b) We offer to execute in conformity with the Bidding Documents the following Works: ${bold(data.Works_Title, 'Procurement of Bed maker (Corn)')}

(c) The total price of our Bid, excluding any discounts offered in item (d) below is: ${bold(data.Total_Bid_Price, 'As per BOQ.')}

(d) The discounts offered and the methodology for their application is: ${bold(data.Discount_Method, 'As Per BOQ')}

(e) Our bid shall be valid for a period of ${bold(data.Bid_Validity_Days, '45')} days from the date fixed for the bid submission deadline in accordance with the Bidding Documents, and it shall remain binding upon us and may be accepted at any time before the expiration of that period;

(f) If our bid is accepted, we commit to obtain a performance security in accordance with the Bidding Document;

(g) We understand that this bid, together with your written acceptance thereof included in your notification of award, shall constitute a binding contract between us, until a formal contract is prepared and executed.

(h) We declare that we have not been blacklisted as per ITB 3.4 and no conflict of interest in the proposed procurement proceedings and we have not been punished for an offense relating to the concerned profession or business.
    `;
        },
        secondPageContent: (data) => {
            const bold = (value, fallback = '') => `[[B]]${value || fallback}[[/B]]`;
            return `
(i) We understand that you are not bound to accept the lowest evaluated bid or any other bid that you may receive; and

(j) If awarded the contract, the person named below shall act as Contractor’s Representative:

(k) We agree to permit the Employer/DP or its representative to inspect our accounts and records and other documents relating to the bid submission and to have them audited by auditors appointed by the Employer.

Name: ${bold(data.Contractor_Representative_Name, 'Dipak Bhandari')}

In the Capacity of : [[B]]Authorized Representative[[/B]]

Signed: [[SIGNATURE]]

Duly Authorized to sign the Bid for and on behalf of : ${bold(data.For_And_On_Behalf_Of, 'Dipak Suppliers')}

[[B]]Date:[[/B]] ${bold(data.Date, '{}')}
    `;
        },
        thirdPageContent: (data) => {
            const bold = (value, fallback = '') => `[[B]]${value || fallback}[[/B]]`;
            return `
[[B]]Name of the contract:[[/B]] ${bold(data.Contract_Name)}

[[B]]Invitation for Bid No:[[/B]] ${bold(data.Invitation_Bid_No)}

[[B]]To[[/B]]
${bold(data.To_Designation, '{}')}
${bold(data.To_Office, '{}')}
${bold(data.To_Address, '{}')}

[[SELF_DECLARATION_TITLE]]

Dear Sir,

We underscore the importance of free, fair and competitive procurement process that precludes fraudulent use. In this respect we have neither offered nor granted, directly or indirectly, any inadmissible advantages to any public servants or other person in connection with our tender, nor will we offer or grant any such incentives or conditions in the present procurement process or, in the event that we are awarded the contract, in the subsequent execution of the contract.

We declare that we have not been black listed and no conflict of interest in the proposed procurement proceeding and we have not been punished for an offense relating to the concerned profession or business. Also we have not included in running contracts more than five (5) since Date: ${bold(data.Date, '{Date from first entry}')}

Name: ${bold(data.Contractor_Representative_Name, '{}')}

In the Capacity of : [[B]]Authorized Representative[[/B]]

Signed: [[SIGNATURE]]

Duly Authorized to sign the Bid for and on behalf of : ${bold(data.For_And_On_Behalf_Of, '{}')}

Date: ${bold(data.Date, '{}')}
    `;
        },
    },
    {
        id: 'letter-of-bid',
        group: 'bidding',
        title: 'Letter of Bid',
        subject: 'Letter of Bid',
        subjectPrefix: '',
        showTopDateRow: false,
        showRecipientDetails: false,
        showSignatureBlock: false,
        fields: [
            { id: 'Date', label: 'Date', type: 'text' },
            { id: 'Contract_Name', label: 'Name of the contract', type: 'text' },
            { id: 'Invitation_Bid_No', label: 'Invitation for Bid No.', type: 'text' },
            { id: 'To_Office', label: 'To', type: 'text', defaultValue: 'xxxxx Municipality, xxxxx' },
            { id: 'Works_Title', label: 'Works title for clause (b)', type: 'text', placeholder: 'insert work title' },
            { id: 'Total_Bid_Price', label: 'Total price for clause (c)', type: 'text', defaultValue: 'As per BOQ.' },
            { id: 'Discount_Percent', label: 'Discount (%)', type: 'text', placeholder: '%' },
            { id: 'Bid_Validity_Days', label: 'Bid validity (days)', type: 'number', placeholder: '90' },
            { id: 'Contractor_Representative_Name', label: 'Contractor’s Representative Name', type: 'text' },
            { id: 'For_And_On_Behalf_Of', label: 'For and on behalf of', type: 'text' },
            { id: 'Bid_Date', label: 'Bid Date', type: 'text', defaultValue: '2082-08-01' },
        ],
        content: (data) => {
            const bold = (value, fallback = '') => `[[B]]${value || fallback}[[/B]]`;
            return `
[[B]]Date:[[/B]] ${bold(data.Date)}

[[B]]Name of the contract:[[/B]] ${bold(data.Contract_Name)}

[[B]]Invitation for Bid No.:[[/B]] ${bold(data.Invitation_Bid_No)}

To: ${bold(data.To_Office, 'xxxxx Municipality, xxxxx')}

We, the undersigned, declare that:

(a)     We have examined and have no reservations to the Bidding Documents, including Addenda issued in accordance with Instructions to Bidders (ITB) Clause 8;

(b)     We offer to execute in conformity with the Bidding Documents the following Works: ${bold(data.Works_Title, '[insert work title]')}

(c)     The total price of our Bid, excluding any discounts offered in item (d) below is: ${bold(data.Total_Bid_Price, 'As per BOQ.')}

(d)     The discounts offered and the methodology for their application for subject contract are ${bold(data.Discount_Percent, '%')}.

(e)     Our bid shall be valid for a period of ${bold(data.Bid_Validity_Days, 'no of days')} days from the date fixed for the bid submission deadline in accordance with the Bidding Documents, and it shall remain binding upon us and may be accepted at any time before the expiration of that period;

(f)     If our bid is accepted, we commit to obtain a performance security in accordance with the Bidding Document;

(g)     Our firm, including any subcontractors or suppliers for any part of the Contract, have nationalities from eligible countries or any countries [insert the nationality of the Bidder, including that of all parties that comprise the Bidder if the Bidder is a consortium or association, and the nationality of each Subcontractor and Supplier];

(h)     We, including any subcontractors or suppliers for any part of the contract, do not have any conflict of interest in accordance with ITB 4.3;

(i)     We are not participating, as a Bidder or as a subcontractor, in more than one bid in this bidding process in accordance with ITB 4.3;

(j)     Our firm, its affiliates or subsidiaries, including any Subcontractors or Suppliers for any part of the contract, has not been declared ineligible, under the Employer's country laws or official regulations or by an act of compliance with a decision of the United Nations Security Council;

`;
        },
        secondPageContent: (data) => {
            const bold = (value, fallback = '') => `[[B]]${value || fallback}[[/B]]`;
            return `
(k)     We are not a government owned entity/We are a government owned entity but meet the requirements of ITB 4.5;

(l)     We understand that this bid, together with your written acceptance thereof included in your notification of award, shall constitute a binding contract between us, until a formal contract is prepared and executed;

(m)     We declare that, we have not been black listed as per ITB 3.4 and no conflict of interest in the proposed procurement proceedings and we have not been punished for an offense relating to the concerned profession or business.

(n)     We declare that we have not running contracts more than five (5) in accordance with ITB 4.8.

(o)     We understand that you are not bound to accept the lowest evaluated bid or any other bid that you may receive; and

(p)     If awarded the contract, the person named below shall act as Contractor's Representative:

(q)     We agree to permit the Employer/DP or its representative to inspect our accounts and records and other documents relating to the bid submission and to have them audited by auditors appointed by the Employer.

Name:  ${bold(data.Contractor_Representative_Name)}

In the capacity of: [[B]]Authorized Representative[[/B]]


Signed: [[SIGNATURE]]

Duly authorized to sign the Bid for and on behalf of: ${bold(data.For_And_On_Behalf_Of)}

[[B]]Date:[[/B]] ${bold(data.Bid_Date, '2082-08-01')}
    `;
        },
    },
];

export default BIDDING_TEMPLATES;
