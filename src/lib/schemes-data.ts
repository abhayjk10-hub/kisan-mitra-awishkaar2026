/**
 * Kisan Schemes, Insurance & Banking Registry
 * Complete official portal database covering Central & State agricultural schemes,
 * crop insurance, health security, and subsidized credit for Indian farmers.
 */

export type SchemeCategory = 'insurance' | 'health' | 'credit' | 'income' | 'solar_infra' | 'pension';

export interface SchemeItem {
  id: string;
  name: string;
  acronym: string;
  category: SchemeCategory;
  categoryLabel: string;
  tagline: string;
  badge: string;
  officialPortalUrl: string;
  helplinePhone: string;
  ministryOrAuthority: string;
  keyBenefits: string[];
  eligibilityCriteria: string[];
  documentsRequired: string[];
  premiumOrFinancialTerms?: string;
  applicationProcedure: string;
  categoryColor: string;
  iconType: 'shield' | 'heart' | 'credit-card' | 'wallet' | 'sun' | 'user-check';
}

export const OFFICIAL_KISAN_SCHEMES: SchemeItem[] = [
  // 1. PMFBY: Crop Insurance
  {
    id: 'scheme-pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    acronym: 'PMFBY',
    category: 'insurance',
    categoryLabel: 'Crop Insurance (फसल बीमा)',
    tagline: 'Comprehensive risk insurance against drought, floods, pest attack & unseasonal rain.',
    badge: 'Govt. Subsidized Crop Cover',
    officialPortalUrl: 'https://pmfby.gov.in/',
    helplinePhone: '14447 (National PMFBY Kisan Call Center)',
    ministryOrAuthority: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
    keyBenefits: [
      'Farmer pays only 1.5% premium for Rabi crops, 2.0% for Kharif, and 5.0% for Horticultural crops',
      'Remaining 95%+ of actuarial premium is shared equally by Central and State Governments',
      'Covers prevented sowing, standing crop damage, localized calamities (hailstorm/cloudburst), and post-harvest losses up to 14 days',
      'Direct claim settlement credited straight into farmer Aadhaar-linked bank account via CROPIC satellite appraisal',
    ],
    eligibilityCriteria: [
      'All farmers growing notified crops in notified areas (both landholders and registered tenant farmers/sharecroppers)',
      'Compulsory or voluntary opt-in through bank or online portal before the seasonal cut-off date (July 31 for Kharif / Dec 31 for Rabi)',
    ],
    documentsRequired: [
      'Aadhaar Card of the farmer',
      'Land Ownership Record (7/12 Extract / Khasra-Khatauni / Patta copy)',
      'Sowing Certificate / Crop Declaration issued by Patwari or Sarpanch',
      'Bank Account Passbook (IFSC & Account number visible)',
    ],
    premiumOrFinancialTerms: 'Max 1.5% to 2% farmer premium; 100% full sum insured claim coverage upon yield loss',
    applicationProcedure: 'Apply online directly at pmfby.gov.in, via CSC (Common Service Centre), or through your nearest bank branch where your KCC loan is held.',
    categoryColor: '#059669', // Emerald
    iconType: 'shield',
  },

  // 2. Weather Based Crop Insurance Scheme (WBCIS)
  {
    id: 'scheme-wbcis',
    name: 'Restructured Weather Based Crop Insurance Scheme (RWBCIS)',
    acronym: 'RWBCIS',
    category: 'insurance',
    categoryLabel: 'Crop Insurance (फसल बीमा)',
    tagline: 'Parametric insurance protecting fruit and vegetable orchards against frost, high wind, rainfall deficit & heat waves.',
    badge: 'Horticulture & Weather Shield',
    officialPortalUrl: 'https://pmfby.gov.in/',
    helplinePhone: '1800-180-1551 (Kisan Call Centre)',
    ministryOrAuthority: 'Department of Agriculture & Farmers Welfare',
    keyBenefits: [
      'Automatic index-based payout trigger based on objective automated weather stations (AWS)',
      'No lengthy field yield loss crop-cutting experiments needed; fast transparent payout',
      'Specialized coverage for Orange, Pomegranate, Grapes, Banana, Onion, and Mango growers',
    ],
    eligibilityCriteria: [
      'Horticultural and perishable crop growers in notified weather-station reference unit areas',
    ],
    documentsRequired: [
      'Aadhaar Card',
      '7/12 Land Record showing perennial fruit tree count (e.g. Nagpur Orange, Nashik Grapes)',
      'Bank account details linked with NPCI Aadhaar bridge',
    ],
    premiumOrFinancialTerms: '5% maximum farmer share for commercial horticultural crops',
    applicationProcedure: 'Enroll before the designated season window through District Horticulture Office or PMFBY portal.',
    categoryColor: '#0d9488', // Teal
    iconType: 'shield',
  },

  // 3. Ayushman Bharat PM-JAY: Health Insurance
  {
    id: 'scheme-pmjay',
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    acronym: 'AB-PMJAY',
    category: 'health',
    categoryLabel: 'Health & Medical Security (स्वास्थ्य बीमा)',
    tagline: 'World\'s largest government health assurance scheme providing ₹5 Lakh free cashless hospital treatment per family per year.',
    badge: '₹5,00,000 Free Cashless Cover',
    officialPortalUrl: 'https://pmjay.gov.in/',
    helplinePhone: '14555 (Ayushman Bharat 24x7 Helpline)',
    ministryOrAuthority: 'National Health Authority (NHA), Ministry of Health & Family Welfare',
    keyBenefits: [
      'Cashless and paperless access to medical treatment up to ₹5,00,000 per family per year',
      'Covers medical examinations, tests, surgery, ICU, hospital room, medications, and 15 days post-hospitalization care',
      'Accepted across 28,000+ empanelled government and private multispeciality hospitals pan-India',
      'Zero age limit, zero pre-existing condition exclusions; all family members covered',
    ],
    eligibilityCriteria: [
      'Rural agricultural laborer and small/marginal farming families identified under SECC database',
      'Holders of Antyodaya Anna Yojana (AAY) or Priority Household (PHH) ration cards',
      'All senior citizens aged 70 and above now eligible for universal Ayushman Vay Vandana card regardless of income',
    ],
    documentsRequired: [
      'Aadhaar Card of all family members',
      'Ration Card / Family Samagra ID / SECC confirmation letter',
      'Active mobile number linked with Aadhaar for OTP authentication',
    ],
    premiumOrFinancialTerms: '100% Free - Zero premium, Zero deductibles, Completely funded by Central & State Governments',
    applicationProcedure: 'Check eligibility instantly at beneficiary.nha.gov.in, download Ayushman App on mobile, or visit your nearest Gram Panchayat CSC or Ayushman Mitra desk at any civil hospital.',
    categoryColor: '#e11d48', // Rose / Red
    iconType: 'heart',
  },

  // 4. Kisan Credit Card (KCC): Banking & Credit
  {
    id: 'scheme-kcc',
    name: 'Kisan Credit Card (KCC) Scheme with Interest Subvention',
    acronym: 'KCC',
    category: 'credit',
    categoryLabel: 'Banking & Credit (रियायती कृषि ऋण)',
    tagline: 'Collateral-free subsidized institutional crop loans up to ₹3 Lakh at an effective low interest rate of just 4% per annum.',
    badge: 'Effective 4% Annual Interest Rate',
    officialPortalUrl: 'https://www.nabard.org/content1.aspx?id=593&catid=23&mid=530',
    helplinePhone: '1800-11-5526 (Kisan Credit Card Helpline)',
    ministryOrAuthority: 'Reserve Bank of India (RBI) & NABARD',
    keyBenefits: [
      'Normal bank lending rate 9% is subsidized: 2% Interest Subvention + 3% Prompt Repayment Incentive = Net 4% interest rate',
      'Collateral-free loan limit up to ₹1.60 Lakh (extended to ₹2.0 Lakh with tie-up agreements)',
      'Revolving cash credit account valid for 5 years with annual renewal based on scale of finance',
      'Includes ₹50,000 accidental death/permanent disability insurance cover for cardholder',
      'Extended to Dairy, Fisheries, Poultry, and Animal Husbandry farmers (up to ₹2 Lakh limit at 4%)',
    ],
    eligibilityCriteria: [
      'Individual owner-cultivator farmers, joint borrowers, tenant farmers, oral lessees, or Self-Help Groups (SHGs)',
      'Age between 18 and 75 years (co-borrower required if applicant is over 60 years)',
    ],
    documentsRequired: [
      'Duly filled one-page simplified KCC loan application form',
      'Aadhaar Card and PAN card',
      'Up-to-date Land Records (7/12 Extract / Khasra / B-1 Khatian)',
      'Declaration of crops sown or proposed to be sown in current agricultural season',
    ],
    premiumOrFinancialTerms: 'Net 4% p.a. on timely annual clearance; loan limit determined by crop scale of finance × acreage + 10% post-harvest consumption + 20% maintenance',
    applicationProcedure: 'Visit your nearest Public Sector Bank, Regional Rural Bank (RRB), or Primary Agricultural Credit Society (PACS), or apply online via PM-KISAN / JanSamarth portal.',
    categoryColor: '#d97706', // Amber / Gold
    iconType: 'credit-card',
  },

  // 5. PM-KISAN: Direct Income Transfer
  {
    id: 'scheme-pmkisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    acronym: 'PM-KISAN',
    category: 'income',
    categoryLabel: 'Direct Income Support (प्रत्यक्ष आय सहायता)',
    tagline: 'Guaranteed annual financial support of ₹6,000 transferred in three equal four-monthly installments of ₹2,000 directly via DBT.',
    badge: '₹6,000/Year Direct Bank Transfer',
    officialPortalUrl: 'https://pmkisan.gov.in/',
    helplinePhone: '155261 / 011-24300606 (PM-KISAN Central Helpline)',
    ministryOrAuthority: 'Ministry of Agriculture & Farmers Welfare',
    keyBenefits: [
      '₹6,000 annual direct cash transfer credited into farmer bank accounts in three rounds (April-July, August-Nov, Dec-March)',
      '100% centrally sponsored with zero broker or commission deductions',
      'Helps smallholder farmers purchase quality seeds, fertilizers, and diesel during peak sowing windows',
    ],
    eligibilityCriteria: [
      'All landholder farmer families with cultivable landholding in their names',
      'Mandatory e-KYC (completed via face authentication on mobile or biometric at CSC)',
      'Bank account must be Aadhaar-seeded with NPCI DBT enablement',
    ],
    documentsRequired: [
      'Aadhaar Card linked with active mobile number',
      'Land Ownership Document (Khatauni / 7-12 Extract)',
      'Aadhaar-seeded bank account details',
    ],
    premiumOrFinancialTerms: 'Direct grant (not a loan; no repayment required)',
    applicationProcedure: 'Self-register via "New Farmer Registration" on pmkisan.gov.in portal or PM-KISAN Mobile App using Aadhaar biometric/face eKYC.',
    categoryColor: '#84cc16', // Lime green
    iconType: 'wallet',
  },

  // 6. PM-KUSUM: Solar Agriculture Pumps
  {
    id: 'scheme-pmkusum',
    name: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)',
    acronym: 'PM-KUSUM',
    category: 'solar_infra',
    categoryLabel: 'Solar Energy & Infrastructure (सोलर पंप योजना)',
    tagline: 'Up to 90% capital subsidy to install off-grid and grid-connected solar agricultural irrigation water pumps.',
    badge: 'Up to 90% Solar Pump Subsidy',
    officialPortalUrl: 'https://pmkusum.mnre.gov.in/',
    helplinePhone: '1800-180-3333 (National Clean Energy Toll Free)',
    ministryOrAuthority: 'Ministry of New & Renewable Energy (MNRE)',
    keyBenefits: [
      'Farmer contributes only 10% of total solar pump cost; 60% is subsidized by Central & State Govts; 30% available as bank loan',
      'Provides dependable 8 hours of daytime solar electricity for field irrigation, ending nighttime canal power struggles',
      'Component-C enables solarizing existing grid pumps with ability to sell surplus clean electricity back to DISCOM for extra income',
    ],
    eligibilityCriteria: [
      'Individual farmers, cooperatives, water user associations with farmland and existing borewell/dugwell or river lift source',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land Record 7/12 Extract showing source of water',
      'Electricity Bill (for existing pump grid solarization)',
      'Bank account details and passport photograph',
    ],
    premiumOrFinancialTerms: 'Farmer pays 10% cost; Central Subsidy 30% + State Subsidy 30% (Up to 60-90% for SC/ST and tribal areas)',
    applicationProcedure: 'Apply online through state renewable energy nodal agencies (e.g. Mahaurja in Maharashtra, GEDA in Gujarat, PEDA in Punjab) or pmkusum.mnre.gov.in.',
    categoryColor: '#ea580c', // Orange
    iconType: 'sun',
  },

  // 7. Agriculture Infrastructure Fund (AIF)
  {
    id: 'scheme-aif',
    name: 'Agriculture Infrastructure Fund (AIF)',
    acronym: 'AIF',
    category: 'solar_infra',
    categoryLabel: 'Farm Infrastructure & Godowns (कृषि अवसंरचना कोष)',
    tagline: '3% annual interest subvention and credit guarantee for building post-harvest cold storages, godowns, primary processing & sorting units.',
    badge: '3% Interest Subvention + CGTMSE',
    officialPortalUrl: 'https://agriinfra.dac.gov.in/',
    helplinePhone: '011-23382012 (AIF Project Management Unit)',
    ministryOrAuthority: 'Department of Agriculture & Farmers Welfare',
    keyBenefits: [
      '3% per annum interest subvention on medium-long term loans up to ₹2 Crore for up to 7 years',
      'Credit guarantee coverage under CGTMSE for loans up to ₹2 Crore with no third-party collateral required',
      'Eligible projects: Cold storages, dry warehouses, pack houses, ripening chambers, dal mills, flour mills, sorting/grading lines',
    ],
    eligibilityCriteria: [
      'Farmers, Farmer Producer Organizations (FPOs), PACS, Agri-entrepreneurs, and Startups',
    ],
    documentsRequired: [
      'Detailed Project Report (DPR) for proposed warehouse/cold storage',
      'Land ownership or minimum 10-year registered lease deed',
      'Aadhaar, PAN, and Bank KYC documents',
    ],
    premiumOrFinancialTerms: '3% interest reduction on commercial bank rate; moratorium period up to 2 years',
    applicationProcedure: 'Submit online application and Detailed Project Report (DPR) on agriinfra.dac.gov.in; once vetted, select your preferred lending bank online.',
    categoryColor: '#6366f1', // Indigo
    iconType: 'credit-card',
  },

  // 8. PM-KMY: Farmer Pension
  {
    id: 'scheme-pmkmy',
    name: 'Pradhan Mantri Kisan Maandhan Yojana (PM-KMY)',
    acronym: 'PM-KMY',
    category: 'pension',
    categoryLabel: 'Social Security & Pension (किसान पेंशन योजना)',
    tagline: 'Guaranteed old-age social security pension of ₹3,000 per month for small and marginal farmers upon reaching 60 years.',
    badge: '₹3,000/Month Lifetime Pension',
    officialPortalUrl: 'https://maandhan.in/',
    helplinePhone: '1800-267-6888 (LIC Pension Helpline)',
    ministryOrAuthority: 'Ministry of Agriculture & Farmers Welfare and Life Insurance Corporation of India (LIC)',
    keyBenefits: [
      'Guaranteed monthly pension of ₹3,000 deposited in bank account upon turning 60 years of age',
      'Equal 50:50 matching contribution: Farmer contributes ₹55 to ₹200/month (depending on entry age); Central Govt matches identical amount',
      'In the event of the pensioner\'s death, the surviving spouse receives 50% family pension (₹1,500/month)',
      'Voluntary contribution can be auto-debited directly from the farmer\'s PM-KISAN cash benefits with zero out-of-pocket hassle',
    ],
    eligibilityCriteria: [
      'Small and marginal farmers owning cultivable land up to 2 hectares (5 acres)',
      'Entry age between 18 and 40 years',
      'Should not be covered under other social security schemes (NPS, ESIC, EPFO)',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Savings Bank Account Passbook (IFSC & Account number)',
      'PM-KISAN registration number (optional for auto-debit)',
    ],
    premiumOrFinancialTerms: 'Monthly contribution ₹55 (for age 18) to ₹200 (for age 40); 100% matched by Central Government',
    applicationProcedure: 'Visit any Common Service Centre (CSC) with your Aadhaar and bank passbook, or enroll online at maandhan.in.',
    categoryColor: '#4f46e5', // Deep Indigo
    iconType: 'user-check',
  },
];

