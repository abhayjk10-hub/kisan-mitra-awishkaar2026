/**
 * Official Minimum Support Prices (MSP) configuration table.
 * Source: Commission for Agricultural Costs and Prices (CACP), Government of India.
 * Season validity defines the marketing year coverage for procurement.
 */

export interface MSPRecord {
  commodity: string;
  aliases: string[];
  category: 'Kharif' | 'Rabi' | 'Commercial';
  season: string;
  validitySeason: string;
  mspPerQuintal: number;
  unit: string;
}

export const OFFICIAL_MSP_CONFIG: MSPRecord[] = [
  {
    commodity: 'Wheat',
    aliases: ['wheat', 'गेहूं', 'गहू', 'कणक'],
    category: 'Rabi',
    season: '2024-25',
    validitySeason: 'Rabi Marketing Season (RMS) 2024-25 (April 2024 – March 2025)',
    mspPerQuintal: 2275,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Paddy (Common)',
    aliases: ['paddy', 'rice', 'धान', 'चावल', 'भात', 'जीरी'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 2300,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Paddy (Grade A)',
    aliases: ['paddy grade a', 'fine rice', 'धान (ग्रेड ए)'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 2320,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Tur / Arhar',
    aliases: ['tur', 'arhar', 'तूर', 'अरहर', 'तुवर'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 7550,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Gram (Chana)',
    aliases: ['chana', 'gram', 'चना', 'हरभरा', 'छोले'],
    category: 'Rabi',
    season: '2024-25',
    validitySeason: 'Rabi Marketing Season (RMS) 2024-25 (April 2024 – March 2025)',
    mspPerQuintal: 5440,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Moong (Green Gram)',
    aliases: ['moong', 'मूंग', 'मुग'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 8682,
    unit: '₹/क्विंटal',
  },
  {
    commodity: 'Urad (Black Gram)',
    aliases: ['urad', 'उड़द', 'उडीद'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 7400,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Soybean (Yellow)',
    aliases: ['soybean', 'soya', 'सोयाबीन'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 4892,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Cotton (Medium Staple)',
    aliases: ['cotton', 'कपास', 'कापूस'],
    category: 'Commercial',
    season: '2024-25',
    validitySeason: 'Commercial Season 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 7121,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Cotton (Long Staple)',
    aliases: ['long cotton', 'लंबे रेशे का कपास', 'लांब धागा कापूस'],
    category: 'Commercial',
    season: '2024-25',
    validitySeason: 'Commercial Season 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 7521,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Mustard & Rapeseed',
    aliases: ['mustard', 'sarson', 'सरसों', 'मोहरी', 'राई'],
    category: 'Rabi',
    season: '2024-25',
    validitySeason: 'Rabi Marketing Season (RMS) 2024-25 (April 2024 – March 2025)',
    mspPerQuintal: 5650,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Groundnut',
    aliases: ['groundnut', 'peanut', 'मूंगफली', 'भुईमूग'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 6783,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Maize',
    aliases: ['maize', 'corn', 'मक्का', 'मका'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 2225,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Bajra',
    aliases: ['bajra', 'millet', 'बाजरा', 'बाजरी'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 2625,
    unit: '₹/क्विंटल',
  },
  {
    commodity: 'Jowar (Hybrid)',
    aliases: ['jowar', 'sorghum', 'ज्वार', 'ज्वारी'],
    category: 'Kharif',
    season: '2024-25',
    validitySeason: 'Kharif Marketing Season (KMS) 2024-25 (October 2024 – September 2025)',
    mspPerQuintal: 3371,
    unit: '₹/क्विंटल',
  },
];

/**
 * Finds MSP configuration for a given commodity name or query string.
 */
export function getMSPForCommodity(query: string): MSPRecord | undefined {
  const clean = query.trim().toLowerCase();
  return OFFICIAL_MSP_CONFIG.find((record) =>
    record.commodity.toLowerCase() === clean ||
    record.aliases.some((alias) => clean.includes(alias.toLowerCase()))
  );
}

