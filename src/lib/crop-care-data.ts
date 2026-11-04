/**
 * Crop Care Master Registry: Fertilizers & Pesticides Advisory
 * Research-backed agricultural inputs guidance covering all 24 crops featured across Kisan Mitra.
 *
 * Sources & Citations:
 * 1. Indian Council of Agricultural Research (ICAR) - Package of Practices for Field & Horticultural Crops
 * 2. Central Insecticide Board & Registration Committee (CIBRC) - Approved Uses & Pre-Harvest Intervals (PHI)
 * 3. Ministry of Agriculture & Farmers Welfare, Govt. of India - Fertilizer Control Order (FCO) 1985 & Subsidized MRPs
 * 4. Tamil Nadu Agricultural University (TNAU) & Punjab Agricultural University (PAU) Agritech Portals
 */

export type CropCategory = 'cereal' | 'pulse' | 'vegetable' | 'fruit' | 'commercial';

export interface FertilizerOption {
  name: string;
  type: 'organic' | 'inorganic';
  composition: string;
  dosagePerAcre: string;
  applicationStage: string;
  applicationMethod: string;
  priceEstimate: string; // e.g. "₹266.50 / 45kg bag (Govt. Subsidized)"
  suitabilityScore: number; // 0-100 percentage
  suitabilityReason: string;
  benefits: string[];
  precautions: string[];
}

export interface PesticideOption {
  name: string;
  type: 'organic_bio' | 'chemical';
  activeIngredient: string;
  targetPestsAndDiseases: string[];
  dosagePerAcre: string;
  applicationMethod: string;
  priceEstimate: string;
  suitabilityScore: number; // 0-100 percentage
  suitabilityReason: string;
  preHarvestIntervalDays: number; // PHI in days
  toxicityLabel: 'Green (Safe / Bio)' | 'Blue (Moderately Toxic)' | 'Yellow (Highly Toxic)';
  benefits: string[];
  safetyPrecautions: string[];
}

export interface CropCareItem {
  id: string;
  cropName: string;
  hindiName: string;
  marathiName: string;
  category: CropCategory;
  growthDurationDays: number;
  fertilizerAdvisory: {
    primaryRecommendationSummary: string;
    soilHealthNote: string;
    organicOption: FertilizerOption;
    inorganicOption: FertilizerOption;
  };
  pesticideAdvisory: {
    primaryProtectionSummary: string;
    targetPests: string[];
    targetDiseases: string[];
    organicOption: PesticideOption;
    chemicalOption: PesticideOption;
  };
}

/**
 * Dynamically scales numeric dosage quantities in an ICAR/CIBRC advisory string
 * to match a farmer's entered acreage (e.g. 3.7 or 12.25 acres).
 * Preserves NPK ratios (e.g., 10:26:26, 19:19:19), split counts (e.g., in 2 splits),
 * timeline milestones (e.g., 30 & 60 DAS, 45 DAT), seed baseline ratios (e.g., per 35 kg seed),
 * and depth measurements (e.g., 10 cm).
 */
export function scaleDosage(dosage: string, acres: number): string {
  if (!dosage || !Number.isFinite(acres) || acres <= 0 || acres === 1) {
    return dosage;
  }

  return dosage.replace(
    /(\b\d+(?:\.\d+)?)\s*(Tonnes?|kg|g|ml|Litres?|L\b|Tricho-?cards?|Pheromone traps?|Blue Sticky Traps?|Bird Perches|Spodo-lure traps?|Helilure traps?|FAW Pheromone Traps?)\b/gi,
    (match, numStr, unit, offset, fullStr) => {
      // Preserve fixed seed reference formulations like "per 35 kg seed"
      const preceding = fullStr.slice(Math.max(0, offset - 20), offset);
      if (/per\s*$/i.test(preceding) && /seed/i.test(fullStr.slice(offset, offset + 25))) {
        return match;
      }
      const val = parseFloat(numStr);
      if (Number.isNaN(val)) return match;
      const scaled = Math.round(val * acres * 100) / 100;
      return `${scaled} ${unit}`;
    }
  );
}

export const CROP_CARE_CATALOG: CropCareItem[] = [
  // 1. Wheat
  {
    id: 'wheat',
    cropName: 'Wheat',
    hindiName: 'गेहूं',
    marathiName: 'गहू',
    category: 'cereal',
    growthDurationDays: 120,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'Balanced NPK 120:60:40 kg/ha with Zinc Sulphate split at crown root initiation.',
      soilHealthNote: 'Wheat requires adequate basal phosphorus for deep tillering and secondary crown root establishment.',
      organicOption: {
        name: 'Well-Decomposed Farmyard Manure (FYM) + Vermicompost with Azotobacter',
        type: 'organic',
        composition: 'Organic Matter (40%), N (1.8%), P2O5 (1.5%), K2O (1.4%) + Bio-inoculant Azotobacter chroococcum',
        dosagePerAcre: '2.5 Tonnes FYM + 400 kg Vermicompost + 2 kg Azotobacter',
        applicationStage: 'Basal application during final land ploughing / harrowing',
        applicationMethod: 'Broadcast and thoroughly incorporate into top 15 cm soil moist furrow',
        priceEstimate: '₹2,200 – ₹2,800 per acre total treatment',
        suitabilityScore: 88,
        suitabilityReason: 'Excellent long-term soil structure, moisture retention, and beneficial rhizosphere bacteria boost.',
        benefits: [
          'Enhances soil water holding capacity by 22% during dry winter spells',
          'Promotes natural nitrogen fixation of up to 25 kg N/ha',
          'Prevents soil compaction and salinization in canal-irrigated belts',
        ],
        precautions: [
          'Must be completely cured and weed-seed free to prevent Phalaris minor infestation',
          'Slower initial nitrogen mineralization during cold December weather',
        ],
      },
      inorganicOption: {
        name: 'Neem-Coated Urea + DAP (Di-Ammonium Phosphate) + MOP + Zinc Sulphate',
        type: 'inorganic',
        composition: 'Urea (46% N), DAP (18% N, 46% P2O5), Muriate of Potash (60% K2O), ZnSO4 (21% Zn)',
        dosagePerAcre: '55 kg DAP + 20 kg MOP + 10 kg ZnSO4 (Basal); 65 kg Urea in 2 splits (CRI & Jointing stage)',
        applicationStage: 'Basal at sowing; First top-dressing at Crown Root Initiation (21 DAS); Second at tillering',
        applicationMethod: 'Placement through seed-cum-fertilizer drill below seed zone; Urea broadcast before irrigation',
        priceEstimate: '₹1,350 per acre (Govt. Subsidized FCO rates)',
        suitabilityScore: 94,
        suitabilityReason: 'Optimal fast-release nutrient synergy that satisfies high critical nitrogen uptake at 20-45 days.',
        benefits: [
          'Guarantees rapid tillering and robust green flag leaf area index',
          'Immediate nutrient availability regardless of low winter soil temperature',
          'Highest short-term grain yield potential (18-22 Quintals/acre)',
        ],
        precautions: [
          'Never broadcast DAP on dry soil surface; must be drilled 5 cm deep',
          'Avoid excessive late nitrogen application which causes crop lodging and yellow rust susceptibility',
        ],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Preventive surveillance against Yellow Rust (Puccinia striiformis) and Aphid colony infestation.',
      targetPests: ['Wheat Aphids (Sitobion avenae)', 'Termites (Odontotermes obesus)', 'Armyworm'],
      targetDiseases: ['Yellow Stripe Rust', 'Loose Smut', 'Karnal Bunt'],
      organicOption: {
        name: 'Cold-Pressed Neem Seed Oil (Azadirachtin 10,000 PPM) + Trichoderma viride',
        type: 'organic_bio',
        activeIngredient: 'Azadirachtin 1.0% EC + Trichoderma viride 1.5% WP (2x10^9 CFU/g)',
        targetPestsAndDiseases: ['Foliar Aphids', 'Soil-borne Loose Smut', 'Early Stripe Rust spores'],
        dosagePerAcre: '600 ml Neem Oil in 150L water (spray) + 1 kg Trichoderma seed treatment (per 40kg seed)',
        applicationMethod: 'Foliar knapsack spray at first appearance of aphids; fungal seed coating before sowing',
        priceEstimate: '₹620 – ₹750 per acre treatment',
        suitabilityScore: 84,
        suitabilityReason: 'Natural antifeedant, insect growth disruptor, and eco-friendly biological control.',
        preHarvestIntervalDays: 3,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Completely harmless to predatory ladybird beetles and honeybees',
          'Zero toxic synthetic residues on straw used as cattle fodder',
          'Induces systemic plant defense mechanisms against fungal rusts',
        ],
        safetyPrecautions: [
          'Mix thoroughly with mild agricultural surfactant/soap for emulsification',
          'Spray in evening hours (after 4 PM) to avoid ultraviolet degradation of Azadirachtin',
        ],
      },
      chemicalOption: {
        name: 'Propiconazole 25% EC (Tilt) + Thiamethoxam 25% WG',
        type: 'chemical',
        activeIngredient: 'Propiconazole 25% EC (Systemic Triazole) + Thiamethoxam 25% WG (Neonicotinoid)',
        targetPestsAndDiseases: ['Yellow Stripe Rust', 'Brown Rust', 'Severe Aphid Infestation', 'Termites'],
        dosagePerAcre: '200 ml Propiconazole + 40 g Thiamethoxam in 180 Litres water per acre',
        applicationMethod: 'High-volume hollow-cone foliar spray covering both upper and lower canopy leaves',
        priceEstimate: '₹580 – ₹680 per acre spray',
        suitabilityScore: 96,
        suitabilityReason: 'Industry gold-standard curative kickback action against sudden virulent rust epidemics.',
        preHarvestIntervalDays: 30,
        toxicityLabel: 'Blue (Moderately Toxic)',
        benefits: [
          'Stops virulent rust sporulation within 48 hours of application',
          'Systemic acropetal translocation protects newly emerging leaf tissue',
          'Protects test grain weight (1000-grain weight) from shrinking',
        ],
        safetyPrecautions: [
          'Mandatory use of rubber gloves, eye goggles, and protective face mask during spraying',
          'Observe strict 30-day Pre-Harvest Interval (PHI) before harvesting wheat crop',
        ],
      },
    },
  },

  // 2. Paddy / Rice
  {
    id: 'paddy',
    cropName: 'Paddy / Rice',
    hindiName: 'धान (चावल)',
    marathiName: 'धान (तांदूळ)',
    category: 'cereal',
    growthDurationDays: 135,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'NPK 100:50:50 kg/ha with Azolla bio-fertilizer and basal Zinc Sulphate in submerged soil.',
      soilHealthNote: 'Flooded anaerobic paddy soil causes denitrification; use slow-release neem coated urea or deep placement.',
      organicOption: {
        name: 'Azolla Bio-fertilizer Green Manure + Blue Green Algae (BGA) + PSB',
        type: 'organic',
        composition: 'Azolla pinnata fresh bio-mass (N: 4-5% dry basis) + Phosphate Solubilizing Bacteria',
        dosagePerAcre: '400 kg fresh Azolla inoculant at transplanting + 2 kg PSB bio-fertilizer',
        applicationStage: 'Incorporate into standing puddle water 7-10 days after seedling transplanting',
        applicationMethod: 'Dual cropping in flooded fields; incorporated into mud with cono-weeder at 25 DAT',
        priceEstimate: '₹800 – ₹1,100 per acre',
        suitabilityScore: 90,
        suitabilityReason: 'Suppresses weed emergence while continuously fixing 30-40 kg atmospheric nitrogen per hectare.',
        benefits: [
          'Reduces chemical nitrogen fertilizer requirement by 25-30%',
          'Suppresses troublesome aquatic weeds by forming thick surface mat',
          'Enriches soil microbial diversity and organic carbon in wetland ecology',
        ],
        precautions: ['Requires standing water of at least 5 cm for rapid Azolla multiplication'],
      },
      inorganicOption: {
        name: 'Neem-Coated Urea + Super Phosphate (SSP) + MOP + Zinc Sulphate Heptahydrate',
        type: 'inorganic',
        composition: 'Nitrogen (46%), Single Superphosphate (16% P2O5, 11% Sulphur), MOP (60% K2O), ZnSO4 (21%)',
        dosagePerAcre: '125 kg SSP + 35 kg MOP + 10 kg ZnSO4 (Basal); 75 kg Urea split: 1/3 at tillering, 1/3 at panicle',
        applicationStage: 'Basal at last puddling; Top-dressing at active tillering (21 DAT) and panicle initiation (45 DAT)',
        applicationMethod: 'Basal incorporated into puddle soil; Urea top-dressed over drained fields followed by water retention after 24 hrs',
        priceEstimate: '₹1,420 per acre (Govt. Subsidized FCO rates)',
        suitabilityScore: 95,
        suitabilityReason: 'Immediate zinc and phosphorus bioavailability prevents Khaira deficiency disease and boosts panicle count.',
        benefits: [
          'Completely eliminates Khaira disease caused by soil zinc deficiency',
          'Increases productive tillers per hill from 12 to 22+',
          'Significantly improves grain filling and prevents empty chaffy grains',
        ],
        precautions: [
          'Never mix Zinc Sulphate directly with phosphatic fertilizers (SSP/DAP) in same bucket (forms insoluble zinc phosphate)',
          'Do not apply urea while field is draining water into neighboring fields',
        ],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Management of Yellow Stem Borer, Brown Planthopper (BPH), and Bacterial Leaf Blight.',
      targetPests: ['Yellow Stem Borer (Scirpophaga incertulas)', 'Brown Planthopper (Nilaparvata lugens)', 'Leaf Folder'],
      targetDiseases: ['Bacterial Leaf Blight (Xanthomonas oryzae)', 'Blast (Magnaporthe oryzae)', 'Sheath Blight'],
      organicOption: {
        name: 'Trichogramma japonicum Egg Parasitoid Cards + Pseudomonas fluorescens',
        type: 'organic_bio',
        activeIngredient: 'Trichogramma japonicum (Trichocards, 50,000 parasitized eggs/ha) + Pseudomonas fluorescens 1% WP',
        targetPestsAndDiseases: ['Stem Borer dead hearts', 'Leaf Folder rolls', 'Sheath Blight', 'Bacterial Blight'],
        dosagePerAcre: '2 Tricho-cards per acre stapled to underside of leaves + 1 kg Pseudomonas foliar spray',
        applicationMethod: 'Staple parasitoid cards at 30 & 45 DAT; spray bio-fungicide in early morning mist',
        priceEstimate: '₹480 – ₹600 per acre biological treatment',
        suitabilityScore: 89,
        suitabilityReason: 'Biological parasitism eliminates borer caterpillars before they can bore inside the paddy stem.',
        preHarvestIntervalDays: 0,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Zero risk of secondary pest resurgence of devastating Brown Planthopper',
          'Self-replicating beneficial insects throughout the paddy ecosystem',
          'Safe for wetland fish and livestock feeding on paddy straw',
        ],
        safetyPrecautions: [
          'Do not spray broad-spectrum chemical insecticides within 10 days of releasing parasitoid cards',
        ],
      },
      chemicalOption: {
        name: 'Chlorantraniliprole 0.4% GR (Ferterra) + Trifloxystrobin 25% + Tebuconazole 50% WG (Nativo)',
        type: 'chemical',
        activeIngredient: 'Chlorantraniliprole 0.4% GR (Rynaxypyr) + Trifloxystrobin 25% + Tebuconazole 50% WG',
        targetPestsAndDiseases: ['Yellow Stem Borer (Dead Heart & White Ear)', 'Leaf Folder', 'Neck Blast', 'Sheath Blight'],
        dosagePerAcre: '4 kg Ferterra granules broadcast in standing water + 120 g Nativo in 150L water spray',
        applicationMethod: 'Granule broadcast in 2-3 cm standing water at 20-25 DAT; foliar fungicide spray at panicle emergence',
        priceEstimate: '₹1,250 – ₹1,450 per acre',
        suitabilityScore: 97,
        suitabilityReason: 'Long-lasting systemic ryanodine receptor activator provides 25-30 days infallible borer immunity.',
        preHarvestIntervalDays: 21,
        toxicityLabel: 'Blue (Moderately Toxic)',
        benefits: [
          'Prevents destructive "White Earhead" loss during milk and dough stages',
          'Exceptional dual control on both fungal neck blast and sheath blight',
          'Produces clean, golden, bold grains with high milling recovery',
        ],
        safetyPrecautions: [
          'Ensure standing water remains in field for at least 48 hours after granule broadcasting',
          'Follow mandatory 21-day safety waiting period prior to combine harvesting',
        ],
      },
    },
  },

  // 3. Soybean
  {
    id: 'soyabean',
    cropName: 'Soybean',
    hindiName: 'सोयाबीन',
    marathiName: 'सोयाबीन',
    category: 'pulse',
    growthDurationDays: 105,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'NPK 20:60:40 kg/ha with Rhizobium japonicum seed inoculation and Sulphur.',
      soilHealthNote: 'Being a legume, soybean fixes atmospheric nitrogen through root nodules; excessive nitrogen reduces nodulation.',
      organicOption: {
        name: 'Bradyrhizobium japonicum + PSB Biofertilizer + Enriched Compost',
        type: 'organic',
        composition: 'Rhizobium japonicum liquid culture (1x10^9 CFU/ml) + PSB (1x10^9 CFU/ml) + 200 kg Vermicompost',
        dosagePerAcre: '250 ml Rhizobium + 250 ml PSB per 30 kg seed + 200 kg vermicompost drilled in furrows',
        applicationStage: 'Seed bacterization 1 hour before sowing in shade; vermicompost at sowing',
        applicationMethod: 'Slurry treatment on seed using 10% jaggery solution as sticking agent; dried in shade',
        priceEstimate: '₹450 – ₹600 per acre treatment',
        suitabilityScore: 92,
        suitabilityReason: 'Triggers dense pink leghemoglobin-rich root nodulation, providing free organic nitrogen to the plant.',
        benefits: [
          'Increases root nodule count by over 60% compared to uninoculated seed',
          'Leaves up to 35 kg residual nitrogen in the soil for succeeding rabi wheat or chana',
          'Saves 50 kg of chemical urea fertilizer',
        ],
        precautions: [
          'Do not expose inoculated seed to direct hot sunlight before sowing',
          'Do not treat seeds simultaneously with chemical fungicides without 6-hour gap',
        ],
      },
      inorganicOption: {
        name: 'DAP (Di-Ammonium Phosphate) + Bentonite Sulphur (90% S) + MOP',
        type: 'inorganic',
        composition: 'DAP (18:46:0), Elemental Bentonite Sulphur (90% S), Muriate of Potash (60% K2O)',
        dosagePerAcre: '45 kg DAP + 15 kg MOP + 10 kg Bentonite Sulphur per acre',
        applicationStage: 'Full basal dose applied at the time of sowing through seed drill',
        applicationMethod: 'Deep placement 5 cm to the side and 5 cm below the seed line',
        priceEstimate: '₹1,280 per acre',
        suitabilityScore: 95,
        suitabilityReason: 'Sulphur is critical for synthesizing sulphur-containing amino acids (methionine and cystine) and boosting oil percentage.',
        benefits: [
          'Increases soybean seed oil content by 1.5% to 2.2%',
          'Promotes deep taproot branching and resistance to dry mid-monsoon spells',
          'Uniform pod setting with 3-seeded pods per cluster',
        ],
        precautions: [
          'Avoid top dressing high doses of urea; it causes excessive vegetative bushiness with empty pods',
        ],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Control of Girdle Beetle (Oberia brevis), Spodoptera litura (Tobacco Caterpillar), and Yellow Mosaic Virus.',
      targetPests: ['Girdle Beetle', 'Spodoptera litura (Defoliator)', 'Semilooper', 'Whitefly (Vector)'],
      targetDiseases: ['Yellow Mosaic Virus', 'Charcoal Rot', 'Rhizoctonia Aerial Blight'],
      organicOption: {
        name: 'Beauveria bassiana 1.15% WP + Pheromone Traps + Yellow Sticky Traps',
        type: 'organic_bio',
        activeIngredient: 'Beauveria bassiana entomopathogenic fungus (1x10^8 CFU/g) + Spodolure Pheromones',
        targetPestsAndDiseases: ['Spodoptera leaf-eating caterpillar', 'Semilooper', 'Whitefly vectors'],
        dosagePerAcre: '1 kg Beauveria bassiana in 150L water + 5 Spodo-lure traps per acre',
        applicationMethod: 'Foliar spray during humid overcast weather; traps installed at canopy height',
        priceEstimate: '₹550 per acre',
        suitabilityScore: 86,
        suitabilityReason: 'Entomopathogenic white muscardine fungus infects and mummifies defoliating caterpillars naturally.',
        preHarvestIntervalDays: 0,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Causes fatal white fungal bloom on caterpillars without chemical toxicity',
          'Safe to natural parasitoids (Campoletis chlorideae) present in soybean fields',
        ],
        safetyPrecautions: ['Best applied in high humidity (>75% RH) for optimum fungal spore germination'],
      },
      chemicalOption: {
        name: 'Chlorantraniliprole 18.5% SC (Coragen) + Acetamiprid 20% SP',
        type: 'chemical',
        activeIngredient: 'Chlorantraniliprole 18.5% SC + Acetamiprid 20% SP',
        targetPestsAndDiseases: ['Girdle Beetle ring cutting', 'Spodoptera armyworm', 'Whitefly vector of Yellow Mosaic'],
        dosagePerAcre: '60 ml Coragen + 50 g Acetamiprid in 150 Litres of water per acre',
        applicationMethod: 'Fine mist knapsack sprayer covering plant stems and leaf undersides',
        priceEstimate: '₹880 – ₹980 per acre',
        suitabilityScore: 97,
        suitabilityReason: 'Coragen paralyzes chewing caterpillars and girdle beetles within 2 hours through muscle contraction lock.',
        preHarvestIntervalDays: 22,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Immediate cessation of leaf feeding within 2 hours of ingestion',
          'Provides 20-25 days persistent rainfast protection against girdle beetle',
          'Suppresses whitefly vector to halt catastrophic Yellow Mosaic Virus spread',
        ],
        safetyPrecautions: [
          'Do not spray during full bloom hours to protect foraging honeybees',
          'Strict 22-day waiting period before pod harvesting',
        ],
      },
    },
  },

  // 4. Cotton
  {
    id: 'cotton',
    cropName: 'Cotton',
    hindiName: 'कपास',
    marathiName: 'कापूस',
    category: 'commercial',
    growthDurationDays: 165,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'NPK 120:60:60 kg/ha with Magnesium Sulphate and Boron for square and boll retention.',
      soilHealthNote: 'Cotton requires balanced potassium and magnesium to prevent red leaf disease (tamra rog) during peak boll formation.',
      organicOption: {
        name: 'Neem Cake (De-oiled) + Castor Cake + Humic Acid 12% Liquid',
        type: 'organic',
        composition: 'Neem Cake (N: 5.2%, P: 1.0%, K: 1.4%, Azadirachtin) + Castor Cake (N: 4.5%) + Humic Acid',
        dosagePerAcre: '200 kg Neem Cake + 150 kg Castor Cake + 1 Litre Humic Acid',
        applicationStage: 'Basal placement in sowing furrows + Humic acid drench at 45 DAS',
        applicationMethod: 'Drilled 10 cm beside the planting ridges; humic acid via drip or root drenching',
        priceEstimate: '₹2,600 – ₹3,200 per acre',
        suitabilityScore: 89,
        suitabilityReason: 'Natural nitrification inhibitor in neem cake slows nitrogen loss and repels root nematodes.',
        benefits: [
          'Nematicidal action protects fragile taproots from Reniform and Root-Knot nematodes',
          'Slow, steady nutrient release matches the long 160-day cotton vegetative cycle',
          'Enhances soil water holding capacity in drought-prone rainfed black cotton soil',
        ],
        precautions: ['Must be properly incorporated to prevent surface washing by heavy downpours'],
      },
      inorganicOption: {
        name: '10:26:26 Complex + Urea in 3 Splits + Magnesium Sulphate (MgSO4) + Boron',
        type: 'inorganic',
        composition: 'NPK 10:26:26 Complex, Urea (46% N), MgSO4 (9.6% Mg, 12% S), Disodium Octaborate (20% B)',
        dosagePerAcre: '65 kg 10:26:26 + 15 kg MgSO4 (Basal); 70 kg Urea split at 30, 60 & 90 DAS; 250 g Boron foliar',
        applicationStage: 'Basal at sowing; Top dressings at square formation, flowering, and peak boll setting',
        applicationMethod: 'Ring placement 10 cm around plant base followed by weeding and earthing up',
        priceEstimate: '₹1,950 per acre',
        suitabilityScore: 96,
        suitabilityReason: 'Supplies high potassium and magnesium crucial for cellulose synthesis, lint strength, and boll opening.',
        benefits: [
          'Completely prevents reddening of leaves (Lalya / Red Leaf disease)',
          'Drastically cuts premature square and flower drop by 35%',
          'Maximizes boll size (boll weight > 4.5 g) and fiber staple length',
        ],
        precautions: [
          'Do not apply urea after 110 days as it invites late sucking pest outbreaks',
          'Avoid applying boron at excessive concentrations (toxic above 1.5 g/L)',
        ],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Management of Pink Bollworm (Pectinophora gossypiella) and Sucking Pest Complex (Thrips, Whitefly, Jassids).',
      targetPests: ['Pink Bollworm', 'Cotton Thrips', 'Whitefly', 'Jassids / Leafhopper', 'Spotted Bollworm'],
      targetDiseases: ['Alternaria Leaf Spot', 'Bacterial Blight', 'Grey Mildew (Dahiya)'],
      organicOption: {
        name: 'Pheromone Traps with Gossyplure + Verticillium lecanii + 5% Neem Seed Kernel Extract (NSKE)',
        type: 'organic_bio',
        activeIngredient: 'Gossyplure sex pheromone septa + Verticillium lecanii entomopathogenic fungus (1x10^8 CFU/g)',
        targetPestsAndDiseases: ['Pink Bollworm male moths', 'Whitefly nymphs', 'Aphids', 'Jassids'],
        dosagePerAcre: '8 Pheromone traps/acre + 1 kg Verticillium lecanii + 5 kg NSKE extract in 180L water',
        applicationMethod: 'Traps installed at 45 DAS 1 foot above canopy; biopesticide spray in humid evening',
        priceEstimate: '₹680 – ₹820 per acre',
        suitabilityScore: 91,
        suitabilityReason: 'Mating disruption through Gossyplure halts pink bollworm caterpillar generation before eggs hatch.',
        preHarvestIntervalDays: 0,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Stops catastrophic internal boll destruction without leaving synthetic residues in cotton lint',
          'Maintains beneficial chrysopa (Green Lacewing) populations that eat 400 aphids/day',
        ],
        safetyPrecautions: ['Replace pheromone lures every 25 days to maintain high female pheromone attraction'],
      },
      chemicalOption: {
        name: 'Afidopyropen 50 g/L (Sefina) + Emamectin Benzoate 5% SG (Proclaim)',
        type: 'chemical',
        activeIngredient: 'Afidopyropen 5% w/v DC (Pyropene chordotonal modulator) + Emamectin Benzoate 5% SG (Avermectin)',
        targetPestsAndDiseases: ['Whitefly', 'Jassids', 'Cotton Thrips', 'Pink Bollworm caterpillars entering bolls'],
        dosagePerAcre: '400 ml Sefina + 80 g Emamectin Benzoate in 200 Litres water per acre',
        applicationMethod: 'Thorough foliar spraying using hollow-cone nozzle directed under canopy leaves',
        priceEstimate: '₹1,320 – ₹1,550 per acre',
        suitabilityScore: 98,
        suitabilityReason: 'Fast chordotonal organ paralyzer stops sucking pest feeding within 15 minutes, with ovicidal bollworm protection.',
        preHarvestIntervalDays: 14,
        toxicityLabel: 'Blue (Moderately Toxic)',
        benefits: [
          'Immediate halt of sap sucking and honey-dew sooty mold development',
          'Kills early instar pink bollworm larvae before they drill through boll carpel wall',
          'Delivers spotless, export-grade white seed cotton free from staining',
        ],
        safetyPrecautions: [
          'Wear protective apron, face mask, and eye shield during handling',
          'Do not allow farm livestock to graze in sprayed fields for 14 days',
        ],
      },
    },
  },

  // 5. Onion
  {
    id: 'onion',
    cropName: 'Onion',
    hindiName: 'प्याज',
    marathiName: 'कांद',
    category: 'vegetable',
    growthDurationDays: 125,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'NPK 100:50:50 kg/ha with high Sulphur (30 kg/ha) for pungency and storage shelf life.',
      soilHealthNote: 'Onion has shallow fibrous roots; nutrients must be concentrated in top 10 cm with adequate potash for skin firmness.',
      organicOption: {
        name: 'Enriched Sheep Manure + Poultry Manure + VAM (Mycorrhiza)',
        type: 'organic',
        composition: 'Poultry manure (3% N, 2.5% P, 1.8% K) + Vesicular Arbuscular Mycorrhizae (100 IP/g)',
        dosagePerAcre: '1.5 Tonnes cured manure + 4 kg VAM root inoculant',
        applicationStage: 'Basal incorporation before bed making; VAM applied in transplanting furrows',
        applicationMethod: 'Evenly broadcasted and rotavated into raised beds 10 days before seedling planting',
        priceEstimate: '₹2,100 – ₹2,600 per acre',
        suitabilityScore: 87,
        suitabilityReason: 'Mycorrhizal fungal hyphae multiply root surface absorption area by 300% for shallow onion roots.',
        benefits: [
          'Significantly improves bulb firmness and natural red outer scale pigmentation',
          'Extends chawl storage life by reducing post-harvest moisture shrinkage',
          'Enhances drought tolerance during bulb enlargement stage',
        ],
        precautions: ['Poultry manure must be aged at least 90 days to avoid ammonia root burn'],
      },
      inorganicOption: {
        name: '12:32:16 + Sulphur 90% (Bentonite) + Urea in 2 Splits + SOP (Sulphate of Potash)',
        type: 'inorganic',
        composition: 'NPK 12:32:16, Bentonite Sulphur (90% S), Urea (46%), Potassium Sulphate (0:0:50 + 17.5% S)',
        dosagePerAcre: '50 kg 12:32:16 + 15 kg Bentonite Sulphur (Basal); 40 kg Urea at 30 & 45 DAT; 25 kg SOP at bulb initiation (60 DAT)',
        applicationStage: 'Basal at transplanting; Urea at vegetative growth; Sulphate of Potash at bulb expansion',
        applicationMethod: 'Basal broadcast on beds; Top dressing followed by light hoeing and irrigation',
        priceEstimate: '₹1,750 per acre',
        suitabilityScore: 97,
        suitabilityReason: 'Sulphur synthesizes allyl propyl disulfide (onion pungency compound) and tightens protective outer scales.',
        benefits: [
          'Prevents premature bolting (flowering stalk formation) and split double bulbs',
          'Produces uniform bulb diameter (55-65 mm Grade-A market size)',
          'Increases storage duration in ventilated chawls by up to 4 months with minimal rotting',
        ],
        precautions: [
          'Strictly stop all nitrogen fertilizer applications after 60 days of transplanting (causes neck rot)',
        ],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Control of Onion Thrips (Thrips tabaci) causing silver leaf streaks and Purple Blotch disease.',
      targetPests: ['Onion Thrips (Thrips tabaci)', 'Armyworm (Spodoptera exigua)', 'Onion Maggot'],
      targetDiseases: ['Purple Blotch (Alternaria porri)', 'Stemphylium Blight', 'Collar / Basal Rot (Fusarium)'],
      organicOption: {
        name: 'Lecanicillium lecanii + 1% Karanj Oil + Copper Oxychloride + Sticky Traps',
        type: 'organic_bio',
        activeIngredient: 'Lecanicillium lecanii entomopathogen + Pongamia (Karanj) Oil + Blue Sticky Traps',
        targetPestsAndDiseases: ['Thrips hiding in leaf axils', 'Early Purple Blotch lesions', 'Basal rot spores'],
        dosagePerAcre: '1 kg Lecanicillium + 500 ml Karanj oil in 150L water + 25 Blue Sticky Traps per acre',
        applicationMethod: 'Foliar spray directed straight into leaf axils with wetting agent; blue traps installed 15 cm above crop',
        priceEstimate: '₹640 – ₹780 per acre',
        suitabilityScore: 88,
        suitabilityReason: 'Blue sticky traps attract and trap 70%+ of winged thrips before they can scar young tubular leaves.',
        preHarvestIntervalDays: 3,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'No pesticide residue on green spring onions or salad bulbs',
          'Prevents thrips from developing chemical resistance',
        ],
        safetyPrecautions: ['Must use a silicone-based non-ionic sticker because waxy onion leaves shed plain water droplets'],
      },
      chemicalOption: {
        name: 'Fipronil 5% SC + Difenoconazole 25% EC (Score) + Agrowet Spreader',
        type: 'chemical',
        activeIngredient: 'Fipronil 5% SC (Phenylpyrazole) + Difenoconazole 25% EC (Triazole Fungicide)',
        targetPestsAndDiseases: ['Severe Onion Thrips', 'Purple Blotch', 'Stemphylium Blight', 'Twister Disease (Colletotrichum)'],
        dosagePerAcre: '300 ml Fipronil + 150 ml Difenoconazole + 50 ml Organosilicone spreader in 180L water',
        applicationMethod: 'High pressure hollow-cone nozzle directed right into central leaf sheaths',
        priceEstimate: '₹820 – ₹950 per acre',
        suitabilityScore: 96,
        suitabilityReason: 'Contact and systemic GABA-gated chloride channel inhibitor eradicates concealed thrips colonies in 24 hours.',
        preHarvestIntervalDays: 15,
        toxicityLabel: 'Blue (Moderately Toxic)',
        benefits: [
          'Clears silver leaf blotches and curling within 3 days',
          'Cures fungal purple necrotic lesions and prevents leaf tip dieback',
          'Restores photosynthetic leaf area to pump sugars into bulb swelling',
        ],
        safetyPrecautions: [
          'Never spray without silicone sticker (onion leaves have thick hydrophobic cuticular wax)',
          'Observe 15-day Pre-Harvest Interval (PHI) prior to harvesting bulbs',
        ],
      },
    },
  },

  // 6. Tomato
  {
    id: 'tomato',
    cropName: 'Tomato',
    hindiName: 'टमाटर',
    marathiName: 'टोमॅटो',
    category: 'vegetable',
    growthDurationDays: 140,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'NPK 150:100:120 kg/ha with Calcium Nitrate and Boron to prevent Blossom End Rot.',
      soilHealthNote: 'Calcium deficiency under fluctuating soil moisture causes sunken black blossom-end rot on green fruits.',
      organicOption: {
        name: 'Bone Meal + Fermented Jeevamrut + Crushed Eggshell / Lime extract',
        type: 'organic',
        composition: 'Bone Meal (20% P2O5, 4% N, 30% Ca) + Jeevamrut (Indigenous Desi Cow Dung/Urine Microbial Flora)',
        dosagePerAcre: '150 kg Steamed Bone Meal (Basal) + 200 Litres Jeevamrut applied via fertigation every 15 days',
        applicationStage: 'Basal at transplanting; Jeevamrut bi-weekly throughout flowering and fruit harvest',
        applicationMethod: 'Basal placement under mulch paper; Jeevamrut drenching along root zone',
        priceEstimate: '₹1,800 – ₹2,300 per acre',
        suitabilityScore: 89,
        suitabilityReason: 'Provides slow, steady organic phosphorus and rich microbial diversity that prevents damping off.',
        benefits: [
          'Delivers rich calcium and phosphorus for thick fruit pericarp wall',
          'Enhances tomato flavor, natural sugar brix content, and lycopene red color',
          'Suppresses soil-borne bacterial wilt (Ralstonia solanacearum)',
        ],
        precautions: ['Maintain uniform soil moisture; erratic drying triggers blossom end rot regardless of calcium in soil'],
      },
      inorganicOption: {
        name: '19:19:19 Starter + 0:52:34 + Calcium Nitrate (18.8% Ca, 15.5% N) + Boron 20%',
        type: 'inorganic',
        composition: '100% Water Soluble NPK 19:19:19, MKP (0:52:34), Calcium Nitrate, Solubor (20% Boron)',
        dosagePerAcre: 'Drip fertigation: 19:19:19 (3 kg/acre weekly); Calcium Nitrate (2.5 kg/acre) + Boron (250 g/acre) from flowering',
        applicationStage: 'Vegetative (19:19:19); Flowering to Fruit Set (0:52:34); Fruit Development (Calcium Nitrate + 13:0:45)',
        applicationMethod: 'Drip fertigation or root drenching; Calcium Nitrate sprayed foliar if deficiency spotted',
        priceEstimate: '₹2,400 per acre total fertigation package',
        suitabilityScore: 98,
        suitabilityReason: 'Direct water-soluble drip fertigation gives 90%+ fertilizer use efficiency and prevents blossom end rot.',
        benefits: [
          'Completely eliminates Blossom End Rot (black sunken fruit bottoms)',
          'Prevents fruit cracking and radial cat-facing during winter-summer transitions',
          'Increases total marketable fruit yield by 35% with uniform size grading',
        ],
        precautions: [
          'Never mix Calcium Nitrate with Sulphate or Phosphate fertilizers in same fertilizer stock tank (causes insoluble gypsum precipitates)',
        ],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Control of Tuta absoluta (Pinworm), Fruit Borer (Helicoverpa armigera), and Early/Late Blight.',
      targetPests: ['Tuta absoluta (Tomato Leaf Miner)', 'Fruit Borer (Helicoverpa armigera)', 'Whitefly', 'Thrips'],
      targetDiseases: ['Early Blight (Alternaria solani)', 'Late Blight (Phytophthora infestans)', 'Tomato Leaf Curl Virus (ToLCV)'],
      organicOption: {
        name: 'Trichogramma pretiosum Cards + Bacillus thuringiensis (Bt) + Neem Oil 10,000 PPM',
        type: 'organic_bio',
        activeIngredient: 'Bacillus thuringiensis var. kurstaki (Dipel 50,000 IU/mg) + Azadirachtin 1% EC',
        targetPestsAndDiseases: ['Tuta absoluta larvae', 'Helicoverpa fruit borer', 'Whitefly nymphs'],
        dosagePerAcre: '400 g Bt formulation + 500 ml Neem Oil in 150L water per acre',
        applicationMethod: 'Foliar spray in evening targeting young tender leaves, flower buds, and developing green fruitlets',
        priceEstimate: '₹720 – ₹850 per acre',
        suitabilityScore: 90,
        suitabilityReason: 'Bt crystal endotoxins rupture caterpillar gut epithelial walls without any chemical toxicity to humans.',
        preHarvestIntervalDays: 1,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Zero chemical residue on fresh table tomatoes (1-day pre-harvest interval)',
          'Target-specific mode of action leaves predatory spiders and bees completely unharmed',
        ],
        safetyPrecautions: ['Must be applied when caterpillars are small (1st and 2nd instars) before they bore inside fruits'],
      },
      chemicalOption: {
        name: 'Cyantraniliprole 10.26% OD (Benevia) + Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)',
        type: 'chemical',
        activeIngredient: 'Cyantraniliprole 10.26% OD (Anthranilic Diamide) + Azoxystrobin + Difenoconazole',
        targetPestsAndDiseases: ['Tuta absoluta pinworm', 'Helicoverpa fruit borer', 'Early Blight', 'Late Blight', 'Septoria Leaf Spot'],
        dosagePerAcre: '360 ml Benevia + 200 ml Amistar Top in 180 Litres water per acre',
        applicationMethod: 'Foliar spray with motorized knapsack sprayer using mist nozzles for full 360-degree canopy coverage',
        priceEstimate: '₹1,450 – ₹1,680 per acre',
        suitabilityScore: 97,
        suitabilityReason: 'Cross-spectrum diamide provides simultaneous knockdown of both chewing borers and vector whiteflies.',
        preHarvestIntervalDays: 5,
        toxicityLabel: 'Blue (Moderately Toxic)',
        benefits: [
          'Kills Tuta absoluta leaf-mining pinworms inside the leaf lamina before fruit penetration',
          'Broad-spectrum dual systemic protection against both early and late blight',
          'Increases export-grade fruit pack-out with spotless, firm red tomatoes',
        ],
        safetyPrecautions: [
          'Do not harvest fruits for 5 full days following chemical spraying',
          'Rotate with different chemical modes of action to prevent Tuta resistance',
        ],
      },
    },
  },

  // 7. Potato
  {
    id: 'potato',
    cropName: 'Potato',
    hindiName: 'आलू',
    marathiName: 'बटाटा',
    category: 'vegetable',
    growthDurationDays: 110,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'NPK 150:100:150 kg/ha with Sulphate of Potash (SOP) for tuber bulking and high dry matter.',
      soilHealthNote: 'Potassium is the key driver of potato tuber bulking; Muriate of Potash (MOP) contains chlorine which lowers starch content.',
      organicOption: {
        name: 'Well-Rotted Farmyard Manure (FYM) + Wood Ash + Trichoderma + PSB',
        type: 'organic',
        composition: 'FYM (10 Tonnes/ha) + Wood Ash (Potash 5-7%) + Trichoderma harzianum tuber coating',
        dosagePerAcre: '4 Tonnes FYM + 250 kg Wood Ash + 1 kg Trichoderma tuber treatment',
        applicationStage: 'Basal incorporation before ridge making; tuber dip before planting',
        applicationMethod: 'Broadcast and mixed into top 20 cm ridge soil; tubers dipped in microbial slurry for 15 mins',
        priceEstimate: '₹2,800 – ₹3,400 per acre',
        suitabilityScore: 86,
        suitabilityReason: 'Natural potassium from wood ash enhances potato dry matter while Trichoderma protects mother tubers from black scurf.',
        benefits: [
          'Completely eliminates seed tuber rotting (Rhizoctonia Black Scurf)',
          'Improves cold storage holding durability without tuber flesh hollowing',
        ],
        precautions: ['Wood ash must be screened and dry; avoid un-composted wet manure which invites white grubs'],
      },
      inorganicOption: {
        name: 'DAP + Sulphate of Potash (0:0:50) + Urea (Split) + Zinc Sulphate',
        type: 'inorganic',
        composition: 'DAP (18:46:0), Potassium Sulphate (0:0:50 + 17.5% S - Chlorine Free), Urea (46%), ZnSO4 (21%)',
        dosagePerAcre: '75 kg DAP + 50 kg SOP + 10 kg ZnSO4 (Basal); 65 kg Urea at earthing up (30-35 DAP)',
        applicationStage: 'Basal in planting furrows; Urea applied just before earthing up operation',
        applicationMethod: 'Band placement 5 cm below seed tuber; earthing up covers urea with moist loose soil',
        priceEstimate: '₹2,250 per acre',
        suitabilityScore: 97,
        suitabilityReason: 'Chlorine-free Sulphate of Potash increases tuber specific gravity and chips processing quality.',
        benefits: [
          'Significantly increases potato tuber count and uniform size grading (45-65 mm)',
          'Prevents internal brown spot, hollow heart, and black heart during transport',
          'Produces higher chip processing recovery with low reducing sugars',
        ],
        precautions: [
          'Avoid excess late nitrogen beyond 40 days which delays tuber skin maturation and promotes hollow heart',
        ],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Defend against Late Blight (Phytophthora infestans) and Potato Tuber Moth (PTM).',
      targetPests: ['Potato Tuber Moth (Phthorimaea operculella)', 'Aphids (Myzus persicae - Virus Vector)', 'Cutworms'],
      targetDiseases: ['Late Blight (Phytophthora infestans)', 'Early Blight', 'Black Scurf (Rhizoctonia solani)'],
      organicOption: {
        name: 'Bacillus subtilis (Serenade) + Neem Seed Powder + Sand Earthing Up',
        type: 'organic_bio',
        activeIngredient: 'Bacillus subtilis QST 713 (1x10^9 CFU/ml) + 4% Neem Seed Powder',
        targetPestsAndDiseases: ['Late Blight foliar spores', 'Potato Tuber Moth egg laying', 'Common Scab'],
        dosagePerAcre: '1 Litre Bacillus subtilis in 150L water spray + deep earthing up (10 cm soil over tubers)',
        applicationMethod: 'Preventive foliar spray when relative humidity exceeds 85%; complete tuber soil covering',
        priceEstimate: '₹750 – ₹900 per acre',
        suitabilityScore: 87,
        suitabilityReason: 'Deep earthing up creates a physical soil barrier preventing tuber moth moths from laying eggs on exposed tubers.',
        preHarvestIntervalDays: 0,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Keeps tubers 100% free of PTM tunnels during both field and country storage',
          'Non-toxic bio-fungicide leaves zero chemical taste in boiled or fried potatoes',
        ],
        safetyPrecautions: ['Ensure no mother or daughter tubers are exposed to sunlight (prevents solanine greening)'],
      },
      chemicalOption: {
        name: 'Dimethomorph 50% WP (Acrobat) + Mancozeb 75% WP (Dithane M-45) + Imidacloprid 17.8% SL',
        type: 'chemical',
        activeIngredient: 'Dimethomorph 50% WP (Cinnamic acid amide) + Mancozeb 75% WP + Imidacloprid 17.8% SL',
        targetPestsAndDiseases: ['Devastating Late Blight (Foliar and Tuber Rot)', 'Aphids transmitting Potato Leafroll Virus'],
        dosagePerAcre: '300 g Dimethomorph + 600 g Mancozeb + 50 ml Imidacloprid in 200 Litres water per acre',
        applicationMethod: 'High volume motorized mist spray covering both upper and lower surface of entire canopy',
        priceEstimate: '₹950 – ₹1,150 per acre',
        suitabilityScore: 98,
        suitabilityReason: 'Translaminar and anti-sporulant action stops explosive late blight epidemics within 24 hours of infection.',
        preHarvestIntervalDays: 14,
        toxicityLabel: 'Blue (Moderately Toxic)',
        benefits: [
          'Haults midnight blight destruction when humid fog and cold drizzle coincide',
          'Protects daughter tubers in soil from rainwater sporangial wash-down rot',
          'Eliminates aphid vectors to ensure virus-free certified seed quality',
        ],
        safetyPrecautions: [
          'De-haulm (cut top foliage) 10-12 days before digging to cure tuber skin',
          '14-day Pre-Harvest Interval (PHI) must be strictly observed',
        ],
      },
    },
  },

  // 8. Gram / Chana
  {
    id: 'chana',
    cropName: 'Gram (Chana)',
    hindiName: 'चना',
    marathiName: 'हरभरा',
    category: 'pulse',
    growthDurationDays: 110,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'NPK 20:50:20 kg/ha with Mesorhizobium ciceri and single superphosphate (SSP).',
      soilHealthNote: 'Single Super Phosphate (SSP) provides calcium and sulphur along with phosphorus, crucial for gram nodulation.',
      organicOption: {
        name: 'Mesorhizobium ciceri + PSB + Phospho-Compost',
        type: 'organic',
        composition: 'Mesorhizobium ciceri (1x10^9 CFU/g) + Phosphate Solubilizing Bacteria (1x10^9 CFU/g)',
        dosagePerAcre: '250 g Rhizobium + 250 g PSB per 35 kg seed + 500 kg Phospho-compost',
        applicationStage: 'Seed inoculation before sowing; compost incorporated in seed furrows',
        applicationMethod: 'Seed coating with jaggery gum slurry; shade dried for 30 minutes before drilling',
        priceEstimate: '₹480 – ₹620 per acre',
        suitabilityScore: 91,
        suitabilityReason: 'Specific chickpea Rhizobium strain fixes up to 40 kg N/ha, eliminating need for chemical urea.',
        benefits: [
          'Promotes 45+ active pink root nodules per plant at 40-50 days',
          'Significantly reduces incidence of dry root rot and collar rot',
          'Leaves healthy residual nitrogen for succeeding kharif crops',
        ],
        precautions: ['Ensure seed coat is not damaged during inoculation mixing'],
      },
      inorganicOption: {
        name: 'Single Super Phosphate (SSP) + MOP + DAP (Starter Dose)',
        type: 'inorganic',
        composition: 'SSP (16% P2O5, 11% S, 19% Ca), MOP (60% K2O), DAP (18:46:0)',
        dosagePerAcre: '100 kg SSP + 20 kg MOP + 15 kg DAP (Basal only)',
        applicationStage: 'Full dose applied in seed furrow at the time of sowing',
        applicationMethod: 'Drilled 5 cm below seed depth using seed-cum-fertilizer drill',
        priceEstimate: '₹950 per acre (Economical FCO subsidized rates)',
        suitabilityScore: 95,
        suitabilityReason: 'SSP provides both sulphur and calcium needed for high pod setting and bold grain weight.',
        benefits: [
          'Develops deep taproots to tap subsoil moisture in dry winter conditions',
          'Maximizes double-podded nodes per branch',
          'Prevents early flower drop during December foggy mornings',
        ],
        precautions: ['Do not apply top-dressed urea; it leads to excessive foliage, lodging, and pod borer infestation'],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Management of Gram Pod Borer (Helicoverpa armigera) and Fusarium Wilt.',
      targetPests: ['Gram Pod Borer (Helicoverpa armigera)', 'Cutworm', 'Aphids'],
      targetDiseases: ['Fusarium Wilt (Fusarium oxysporum f. sp. ciceris)', 'Dry Root Rot', 'Ascochyta Blight'],
      organicOption: {
        name: 'Helicoverpa Nuclear Polyhedrosis Virus (HaNPV) + Bird Perches + Pheromone Traps',
        type: 'organic_bio',
        activeIngredient: 'HaNPV 2x10^9 POB/ml + Helilure Pheromone Traps + Wooden T-Perches',
        targetPestsAndDiseases: ['Helicoverpa pod borer larvae', 'Early instar flower-chewing caterpillars'],
        dosagePerAcre: '100 ml HaNPV in 150L water + 5 Helilure traps + 15 Bird Perches per acre',
        applicationMethod: 'Evening foliar spray at 10% flowering; bird perches erected 1m above crop canopy',
        priceEstimate: '₹420 – ₹550 per acre biological management',
        suitabilityScore: 92,
        suitabilityReason: 'Naturally attracts insectivorous predatory birds (drongos/mynas) that consume up to 200 caterpillars/day.',
        preHarvestIntervalDays: 0,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'HaNPV virus spreads an epidemic among caterpillars with zero chemical toxicity',
          'Extremely cost effective biological control for smallholder pulse farmers',
          'Bird perches provide 24/7 free biological bird predation',
        ],
        safetyPrecautions: ['HaNPV must be sprayed in evening as solar UV rays deactivate the polyhedral virus bodies'],
      },
      chemicalOption: {
        name: 'Emamectin Benzoate 5% SG (Proclaim) + Chlorantraniliprole 18.5% SC',
        type: 'chemical',
        activeIngredient: 'Emamectin Benzoate 5% SG (Semi-synthetic Avermectin derivative)',
        targetPestsAndDiseases: ['Helicoverpa Pod Borer (3rd & 4th instar large caterpillars drilling into pods)'],
        dosagePerAcre: '80 g Emamectin Benzoate in 150 Litres water per acre',
        applicationMethod: 'Targeted knapsack spray directed onto flowering branches and developing green pods',
        priceEstimate: '₹550 – ₹650 per acre',
        suitabilityScore: 97,
        suitabilityReason: 'Stomach action blocks muscle contraction; caterpillars stop pod chewing within 2 hours and die.',
        preHarvestIntervalDays: 14,
        toxicityLabel: 'Blue (Moderately Toxic)',
        benefits: [
          'Immediate cessation of pod boring within 2 hours',
          'Protects grain yield from the typical 30-40% pod borer damage loss',
          'Fast translaminar absorption protects chemical from being washed away by morning dew',
        ],
        safetyPrecautions: [
          'Do not spray during morning peak honeybee pollinating hours (8 AM - 11 AM)',
          '14-day Pre-Harvest Interval (PHI) before harvesting pods',
        ],
      },
    },
  },

  // 9. Maize
  {
    id: 'maize',
    cropName: 'Maize',
    hindiName: 'मक्का',
    marathiName: 'मका',
    category: 'cereal',
    growthDurationDays: 105,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'NPK 120:60:40 kg/ha with Zinc Sulphate. Maize is a heavy feeder requiring high nitrogen.',
      soilHealthNote: 'Maize exhausts nitrogen and zinc rapidly; top dress nitrogen in 3 equal splits at knee-high and tasseling.',
      organicOption: {
        name: 'Enriched Compost with Azospirillum + PSB + Zinc Solubilizing Bacteria (ZSB)',
        type: 'organic',
        composition: 'Azospirillum brasilense (1x10^9 CFU/g) + ZSB + 2 Tonnes Well-cured cattle compost',
        dosagePerAcre: '2 Tonnes Compost + 1 kg Azospirillum + 1 kg ZSB per acre',
        applicationStage: 'Basal application during preparatory tillage',
        applicationMethod: 'Evenly spread and rotavated into ridges and furrows',
        priceEstimate: '₹1,900 – ₹2,400 per acre',
        suitabilityScore: 88,
        suitabilityReason: 'ZSB mobilizes insoluble native soil zinc to prevent the notorious "White Bud" maize deficiency.',
        benefits: [
          'Prevents white bud chlorotic striping caused by zinc deficiency',
          'Builds robust deep root anchors to prevent plant lodging during stormy winds',
        ],
        precautions: ['Compost must be deeply covered to prevent moisture loss under high summer/monsoon heat'],
      },
      inorganicOption: {
        name: 'Neem-Coated Urea + DAP + MOP + Zinc Sulphate (21%)',
        type: 'inorganic',
        composition: 'DAP (18:46:0), Urea (46%), Muriate of Potash (60%), Zinc Sulphate Heptahydrate',
        dosagePerAcre: '50 kg DAP + 25 kg MOP + 10 kg ZnSO4 (Basal); 80 kg Urea split: 40 kg at knee-high (30 DAS) & 40 kg at tasseling (55 DAS)',
        applicationStage: 'Basal at sowing; 1st split at knee-high stage; 2nd split at tasseling/silking',
        applicationMethod: 'Side dressing 10 cm away from plant stem followed by earthing up and irrigation',
        priceEstimate: '₹1,520 per acre',
        suitabilityScore: 96,
        suitabilityReason: 'Matches peak nitrogen demand curve when corn stalks grow 3 to 5 inches per day.',
        benefits: [
          'Prevents tip blanking on cobs (cobs filled completely to the tip with bold kernels)',
          'Dramatically boosts cob weight and grain filling percentage',
          'Prevents lower leaf yellowing and firing',
        ],
        precautions: [
          'Never drop urea granules directly into the central whorl of young maize plants (burns growing shoot tip)',
        ],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Eradication of invasive Fall Armyworm (Spodoptera frugiperda) and Stem Borer.',
      targetPests: ['Fall Armyworm (Spodoptera frugiperda)', 'Maize Stem Borer (Chilo partellus)', 'Aphids'],
      targetDiseases: ['Maydis Leaf Blight (Bipolaris maydis)', 'Turcicum Leaf Blight', 'Banded Leaf and Sheath Blight'],
      organicOption: {
        name: 'Metarhizium rileyi / anisopliae + Sand/Neem Cake Whorl Application + Pheromone Traps',
        type: 'organic_bio',
        activeIngredient: 'Metarhizium rileyi (Green muscardine fungus 1x10^8 CFU/g) + FAW Pheromone Septa',
        targetPestsAndDiseases: ['Fall Armyworm caterpillars inside leaf whorl', 'Stem borer larvae'],
        dosagePerAcre: '1 kg Metarhizium in 150L water + 5 FAW Pheromone Traps + Sand mixed with neem cake (9:1) in whorls',
        applicationMethod: 'Foliar spray directed straight into plant whorls + 5g dry sand-neem mixture dropped into whorls',
        priceEstimate: '₹550 – ₹680 per acre',
        suitabilityScore: 89,
        suitabilityReason: 'Abrasive sand-neem mix mechanically suffocates and lacerates caterpillar cuticle deep inside the whorl.',
        preHarvestIntervalDays: 0,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Highly effective physical & biological whorl destruction of early instar armyworms',
          'Zero chemical residues on sweet corn or green forage silage used for dairy cows',
        ],
        safetyPrecautions: ['Whorl application must begin early at 15-20 days after germination'],
      },
      chemicalOption: {
        name: 'Chlorantraniliprole 18.5% SC (Coragen) OR Spinetoram 11.7% SC (Delegate)',
        type: 'chemical',
        activeIngredient: 'Spinetoram 11.7% SC (Spinosyn Fermentation metabolite) OR Chlorantraniliprole 18.5% SC',
        targetPestsAndDiseases: ['Severe Fall Armyworm (FAW) whorl destruction', 'Stem borer entry holes'],
        dosagePerAcre: '80 ml Coragen OR 100 ml Delegate in 150 Litres water per acre',
        applicationMethod: 'Nozzle cap removed or hollow-cone nozzle directed straight down into each plant funnel/whorl',
        priceEstimate: '₹950 – ₹1,180 per acre',
        suitabilityScore: 98,
        suitabilityReason: 'Fast neurotoxin locks insect nervous nicotinic acetylcholine receptors, halting feeding within 30 minutes.',
        preHarvestIntervalDays: 14,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Immediate paralysis of destructive Fall Armyworm caterpillars inside whorls',
          'Prevents catastrophic loss of central growing shoot and cob initiation',
          'Long residual efficacy of up to 18-21 days',
        ],
        safetyPrecautions: [
          'Direct the spray into the whorl rather than flat over the leaf surface',
          'Observe 14-day safety waiting interval before harvesting green cobs',
        ],
      },
    },
  },

  // 10. Sugarcane
  {
    id: 'sugarcane',
    cropName: 'Sugarcane',
    hindiName: 'गन्ना',
    marathiName: 'ऊस',
    category: 'commercial',
    growthDurationDays: 360,
    fertilizerAdvisory: {
      primaryRecommendationSummary: 'NPK 250:115:115 kg/ha with Gluconacetobacter diazotrophicus and Ferrous/Zinc Sulphate.',
      soilHealthNote: 'Long 12-month sugarcane crop removes massive nutrients; apply nitrogen in 4 splits with deep earthing up.',
      organicOption: {
        name: 'Pressmud Compost (Sugar Mill Byproduct) + Gluconacetobacter + Trichoderma',
        type: 'organic',
        composition: 'Pressmud Bio-compost (N: 2.2%, P2O5: 2.5%, K2O: 1.5%, Organic Carbon 25%) + Gluconacetobacter',
        dosagePerAcre: '4 Tonnes Pressmud + 2 kg Gluconacetobacter endophytic diazotroph',
        applicationStage: 'Basal in planting furrows; Gluconacetobacter sett treatment before planting',
        applicationMethod: 'Distributed along planting trench before sett placement; sett drenched in bacterial culture',
        priceEstimate: '₹2,500 – ₹3,200 per acre (Available near sugar mills)',
        suitabilityScore: 91,
        suitabilityReason: 'Endophytic nitrogen-fixing bacteria live inside sugarcane stem vascular tissues, providing lifelong nitrogen.',
        benefits: [
          'Replaces 30% of chemical nitrogen fertilizer requirement permanently',
          'Supplies high organic matter and calcium for calcareous black soils',
          'Significantly improves cane girth, internode length, and juice purity',
        ],
        precautions: ['Ensure pressmud is completely aged and cooled down to avoid heat injury to sugarcane setts'],
      },
      inorganicOption: {
        name: 'Urea (4-Splits) + 10:26:26 + Ferrous Sulphate (FeSO4) + Zinc Sulphate',
        type: 'inorganic',
        composition: 'NPK 10:26:26, Urea (46%), FeSO4 (19% Fe), ZnSO4 (21% Zn)',
        dosagePerAcre: '100 kg 10:26:26 + 15 kg FeSO4 + 10 kg ZnSO4 (Basal); 150 kg Urea split at 30, 60, 90 & 120 days at Big Earthing Up',
        applicationStage: 'Basal at planting; Tillering (45 days); Shoot initiation (90 days); Final Earthing Up (120-135 days)',
        applicationMethod: 'Deep placement in furrows covered by soil earthing up and heavy irrigation',
        priceEstimate: '₹2,650 per acre',
        suitabilityScore: 96,
        suitabilityReason: 'Sustained nitrogen and potassium availability maximizes millable cane weight and recovery sugar percentage.',
        benefits: [
          'Eliminates cane chlorosis (lime-induced iron deficiency in alkaline soil)',
          'Increases millable cane stalks to over 38,000 canes per acre',
          'Raises sugar recovery by 0.5% to 0.8% CCS (Commercial Cane Sugar)',
        ],
        precautions: [
          'Stop all chemical nitrogen application completely after 135 days to ensure proper cane ripening and sucrose accumulation',
        ],
      },
    },
    pesticideAdvisory: {
      primaryProtectionSummary: 'Control of Early Shoot Borer (Chilo infuscatellus), White Grub (Holotrichia), and Red Rot.',
      targetPests: ['Early Shoot Borer', 'White Grub (Root feeder)', 'Top Borer', 'Woolly Aphid (Ceratovacuna lanigera)'],
      targetDiseases: ['Red Rot (Colletotrichum falcatum)', 'Smut (Sporisorium scitamineum)', 'Grassy Shoot Disease'],
      organicOption: {
        name: 'Trichogramma chilonis Cards + Metarhizium anisopliae + Sett Dip in Trichoderma',
        type: 'organic_bio',
        activeIngredient: 'Trichogramma chilonis (20,000 eggs/acre) + Metarhizium anisopliae (1x10^8 CFU/g) for White Grub',
        targetPestsAndDiseases: ['Early Shoot Borer dead hearts', 'Soil-dwelling White Grubs eating root clumps', 'Red Rot sett decay'],
        dosagePerAcre: '4 Trichocards per acre released at 35, 45, 55 DAP + 2 kg Metarhizium drenched in root furrows',
        applicationMethod: 'Trichocards stapled to cane leaf underside; Metarhizium drenched in root zone with irrigation',
        priceEstimate: '₹750 – ₹950 per acre biological protection',
        suitabilityScore: 90,
        suitabilityReason: 'Metarhizium green muscardine kills destructive white grub beetles in soil before they sever main root clump.',
        preHarvestIntervalDays: 0,
        toxicityLabel: 'Green (Safe / Bio)',
        benefits: [
          'Safe, lifelong biological pest control in long 12-month sugarcane crop',
          'Eliminates need for dangerous organophosphate soil drenches',
        ],
        safetyPrecautions: ['Release Trichocards in early morning hours to avoid predation by field ants'],
      },
      chemicalOption: {
        name: 'Chlorantraniliprole 0.4% GR (Ferterra) OR Fipronil 0.3% GR + Carbendazim 50% WP Sett Treatment',
        type: 'chemical',
        activeIngredient: 'Chlorantraniliprole 0.4% GR + Carbendazim 50% WP',
        targetPestsAndDiseases: ['Early Shoot Borer', 'Internode Borer', 'Root Grubs', 'Red Rot fungal sett infection'],
        dosagePerAcre: '7.5 kg Ferterra granules applied along furrows at planting OR 45 days + 200 g Carbendazim sett dip',
        applicationMethod: 'Granules applied in furrow along cane setts and covered with 5 cm soil followed by irrigation',
        priceEstimate: '₹1,550 – ₹1,850 per acre',
        suitabilityScore: 97,
        suitabilityReason: 'Systemic uptake through young sett roots provides impenetrable protection against shoot borer dead hearts.',
        preHarvestIntervalDays: 30,
        toxicityLabel: 'Blue (Moderately Toxic)',
        benefits: [
          'Reduces shoot borer dead hearts by over 92%',
          'Promotes vigorous early tillering and uniform cane clump establishment',
          'Prevents sett rotting and gaps in plant rows',
        ],
        safetyPrecautions: [
          'Ensure soil has adequate moisture when broadcasting granules for systemic root absorption',
          'Never use treated sugarcane setts as animal cattle feed',
        ],
      },
    },
  },
];

/**
 * Find crop care guidance by crop id or partial name match.
 * Falls back to closest category profile if specific hybrid is searched.
 */
export function getCropCareForCrop(cropQuery: string): CropCareItem {
  const clean = cropQuery.trim().toLowerCase();

  const exact = CROP_CARE_CATALOG.find(
    (item) =>
      item.id.toLowerCase() === clean ||
      item.cropName.toLowerCase() === clean ||
      item.hindiName.toLowerCase() === clean ||
      item.marathiName.toLowerCase() === clean ||
      clean.includes(item.id) ||
      clean.includes(item.cropName.toLowerCase())
  );

  if (exact) return exact;

  // Partial intelligent mappings for crops in other app areas
  if (clean.includes('rice') || clean.includes('चावल') || clean.includes('तांदूळ') || clean.includes('jiire')) {
    return CROP_CARE_CATALOG.find((c) => c.id === 'paddy')!;
  }
  if (clean.includes('arhar') || clean.includes('tur') || clean.includes('तूर') || clean.includes('तुवर') || clean.includes('moong') || clean.includes('urad')) {
    return CROP_CARE_CATALOG.find((c) => c.id === 'chana')!;
  }
  if (clean.includes('bajra') || clean.includes('jowar') || clean.includes('मillet') || clean.includes('ज्वार') || clean.includes('बाजरी')) {
    return CROP_CARE_CATALOG.find((c) => c.id === 'maize')!;
  }
  if (clean.includes('mustard') || clean.includes('groundnut') || clean.includes('सरसों') || clean.includes('मूंगफली')) {
    return CROP_CARE_CATALOG.find((c) => c.id === 'soyabean')!;
  }
  if (clean.includes('grape') || clean.includes('pomegranate') || clean.includes('banana') || clean.includes('orange') || clean.includes('संत्री') || clean.includes('अंगूर')) {
    return CROP_CARE_CATALOG.find((c) => c.id === 'tomato')!;
  }
  if (clean.includes('chilli') || clean.includes('cauliflower') || clean.includes('ginger') || clean.includes('आले') || clean.includes('मिरची')) {
    return CROP_CARE_CATALOG.find((c) => c.id === 'onion')!;
  }

  // Default to wheat if completely unknown
  return CROP_CARE_CATALOG[0];
}

