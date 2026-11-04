/**
 * Farm Machinery Rental Master Registry
 * Comprehensive catalog covering every farming stage from land preparation to post-harvest hulling.
 *
 * Sources & Citations:
 * 1. Sub-Mission on Agricultural Mechanization (SMAM), Ministry of Agriculture & Farmers Welfare, Govt of India
 * 2. FARMS - Mobile App for Custom Hiring Centres (CHC) Benchmark Rental Rates (Punjab, Haryana, Maharashtra, MP)
 * 3. Central Institute of Agricultural Engineering (ICAR-CIAE Bhopal) - Farm Machinery Directory
 */

export type FarmingStage = 'ploughing' | 'sowing' | 'harvesting' | 'threshing' | 'hulling' | 'land_prep' | 'protection';

export interface Machinery3DHotspot {
  name: string;
  description: string;
  x: number;
  y: number;
  z: number;
}

export interface RentalProvider {
  id: string;
  name: string;
  type: 'Govt. Custom Hiring Centre (CHC)' | 'Farmer Producer Company (FPO)' | 'Private Agri Fleet';
  operatorName: string;
  operatorPhone: string;
  hubLocation: string;
  district: string;
  state: string;
  distanceKm: number;
  rating: number; // 1-5
  operatorIncluded: boolean;
  fuelIncluded: boolean;
}

export interface FarmMachine {
  id: string;
  name: string;
  hindiName: string;
  marathiName: string;
  stage: FarmingStage;
  stageLabel: string;
  hpRequired: string;
  workingWidthOrCapacity: string;
  hourlyRentalRate: number; // in INR
  perAcreRentalRate?: number; // in INR
  rentalUnit: string;
  description: string;
  specifications: Record<string, string>;
  suitableCrops: string[];
  provider: RentalProvider;
  model3DConfig: {
    primaryColor: string;
    accentColor: string;
    geometryType: 'tractor_plough' | 'seed_drill' | 'combine_harvester' | 'axial_thresher' | 'rice_huller' | 'laser_leveller' | 'boom_sprayer';
    wireframePolygons: number;
    dimensions: [number, number, number]; // [length, width, height] relative scale
    hotspots: Machinery3DHotspot[];
  };
}

export const FARM_MACHINERY_CATALOG: FarmMachine[] = [
  // 1. Ploughing: Heavy Reversible MB Plough
  {
    id: 'mac-plough-01',
    name: '55 HP Tractor with Hydraulic Reversible MB Plough',
    hindiName: 'हाइड्रोलिक रिवर्सिबल मोल्डबोर्ड हल (एमबी प्लाउ)',
    marathiName: 'हायड्रॉलिक रिव्हर्सिबल एम.बी. नांगर',
    stage: 'ploughing',
    stageLabel: 'Ploughing & Deep Tillage',
    hpRequired: '50 – 60 HP Tractor',
    workingWidthOrCapacity: '2 or 3 Bottom Reversible (Depth: 25-35 cm)',
    hourlyRentalRate: 950,
    perAcreRentalRate: 1200,
    rentalUnit: '₹950 / Hour (With Tractor & Driver)',
    description: 'Heavy-duty hydraulic two-way reversible plough engineered for deep black soil inversion, weed eradication, and breaking subsoil hardpan.',
    specifications: {
      'Working Depth': '25 – 35 cm (10 – 14 inches)',
      'Furrow Width': '35 cm per bottom',
      'Hydraulic Turnover': 'Single acting hydraulic cylinder with automatic lock',
      'Field Capacity': '0.8 – 1.0 Acre per hour',
      'Fuel Consumption': '4.5 – 5.5 Litres diesel per hour',
    },
    suitableCrops: ['Cotton', 'Sugarcane', 'Soybean', 'Wheat', 'Maize', 'Paddy'],
    provider: {
      id: 'chc-pun-01',
      name: 'Gultekdi APMC Custom Hiring Centre (CHC)',
      type: 'Govt. Custom Hiring Centre (CHC)',
      operatorName: 'Babanrao Shinde',
      operatorPhone: '+919822114477',
      hubLocation: 'Gate 3, Gultekdi Market Yard, Pune',
      district: 'Pune',
      state: 'Maharashtra',
      distanceKm: 6.5,
      rating: 4.85,
      operatorIncluded: true,
      fuelIncluded: true,
    },
    model3DConfig: {
      primaryColor: '#c2410c', // Tractor orange/red
      accentColor: '#1e293b', // Steel grey
      geometryType: 'tractor_plough',
      wireframePolygons: 340,
      dimensions: [3.8, 1.8, 2.2],
      hotspots: [
        { name: 'Hydraulic Reversing Cylinder', description: 'Enables 180° rotation of mouldboard shares for bidirectional furrowing', x: -0.8, y: 0.3, z: 0.4 },
        { name: 'High Carbon Steel Shares', description: 'Heat-treated borated wear-resistant cutting points for rocky soil', x: -1.2, y: -0.4, z: 0.0 },
        { name: 'Tractor 3-Point Hitch', description: 'Category II standardized universal linkage compatible with all 50+ HP tractors', x: 0.0, y: 0.2, z: 0.0 },
      ],
    },
  },

  // 2. Ploughing & Clod Crushing: Heavy Rotavator
  {
    id: 'mac-rotavator-02',
    name: 'Multi-Speed Gear Drive Rotavator (7-Feet, 48 L-Blades)',
    hindiName: 'मल्टी-स्पीड रोटावेटर (7 फीट, 48 ब्लेड)',
    marathiName: 'मल्टी-स्पीड रोटाव्हेटर (७ फूट, ४८ पाते)',
    stage: 'ploughing',
    stageLabel: 'Secondary Tillage & Clod Crushing',
    hpRequired: '45 – 55 HP Tractor',
    workingWidthOrCapacity: '2.1 Metres (7 Feet Working Width)',
    hourlyRentalRate: 850,
    perAcreRentalRate: 1050,
    rentalUnit: '₹850 / Hour (With Tractor & Driver)',
    description: 'High-speed rotary tiller that pulversizes heavy clods into fine seedbed tilt in a single pass while incorporating green manure or crop residues.',
    specifications: {
      'Rotor Speed': '210 – 240 RPM (Multi-Speed Gearbox)',
      'Number of Blades': '48 Boron Steel L-Type Blades',
      'Tillage Depth': '12 – 18 cm adjustable',
      'Field Capacity': '1.2 Acres per hour',
      'Transmission': 'Heavy Duty Side Gear Drive in oil bath',
    },
    suitableCrops: ['Wheat', 'Gram / Chana', 'Paddy (Puddling)', 'Vegetables', 'Onion', 'Potato'],
    provider: {
      id: 'fpo-brm-01',
      name: 'Baramati Krishi Vikas FPC Machinery Pool',
      type: 'Farmer Producer Company (FPO)',
      operatorName: 'Sunil Jagtap',
      operatorPhone: '+919822338811',
      hubLocation: 'MIDC Agro Complex, Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      distanceKm: 14.2,
      rating: 4.9,
      operatorIncluded: true,
      fuelIncluded: true,
    },
    model3DConfig: {
      primaryColor: '#047857', // Emerald green
      accentColor: '#334155',
      geometryType: 'tractor_plough',
      wireframePolygons: 290,
      dimensions: [3.4, 2.1, 1.9],
      hotspots: [
        { name: 'Multi-Speed Gearbox', description: 'Dual ratio gears for varying soil pulverized texture requirements', x: 0.0, y: 0.5, z: 0.0 },
        { name: 'Boron Steel L-Blades', description: 'Special curved geometry prevents mud wrapping during wet paddy puddling', x: 0.0, y: -0.3, z: 0.8 },
      ],
    },
  },

  // 3. Sowing: Automatic Multi-Crop Seed-cum-Fertilizer Drill
  {
    id: 'mac-drill-03',
    name: 'Automatic Multi-Crop Seed-cum-Fertilizer Drill (9-Tynes)',
    hindiName: 'स्वचालित बीज एवं उर्वरक बुवाई मशीन (सीड ड्रिल)',
    marathiName: 'स्वयंचलित बियाणे व खत पेरणी यंत्र (९ फणांचे)',
    stage: 'sowing',
    stageLabel: 'Precision Sowing & Planting',
    hpRequired: '35 – 45 HP Tractor',
    workingWidthOrCapacity: '9 Tynes / Rows (Row spacing adjustable 15 - 30 cm)',
    hourlyRentalRate: 650,
    perAcreRentalRate: 800,
    rentalUnit: '₹650 / Hour',
    description: 'Precision mechanical fluted roller drill that places seed and fertilizer simultaneously in two separate soil layers for zero seed scorching.',
    specifications: {
      'Metering Mechanism': 'Fluted roller for seed; cell wheel for fertilizer',
      'Hopper Capacity': 'Seed: 60 kg, Fertilizer: 65 kg',
      'Depth Control': 'Independent gauge wheels (2 to 7 cm seed depth)',
      'Furrow Openers': 'Inverted T-type / Shovel type for zero-till conditions',
      'Field Capacity': '1.5 Acres per hour',
    },
    suitableCrops: ['Wheat', 'Gram / Chana', 'Soybean', 'Mustard', 'Maize', 'Bajra', 'Jowar'],
    provider: {
      id: 'chc-ahm-01',
      name: 'Ahmednagar Kisan Seva CHC Hub',
      type: 'Govt. Custom Hiring Centre (CHC)',
      operatorName: 'Dnyandev Gholap',
      operatorPhone: '+919822661199',
      hubLocation: 'Station Road, Near APMC, Ahmednagar',
      district: 'Ahmednagar',
      state: 'Maharashtra',
      distanceKm: 8.0,
      rating: 4.8,
      operatorIncluded: true,
      fuelIncluded: false,
    },
    model3DConfig: {
      primaryColor: '#2563eb', // Royal blue
      accentColor: '#cbd5e1',
      geometryType: 'seed_drill',
      wireframePolygons: 380,
      dimensions: [3.2, 2.3, 1.8],
      hotspots: [
        { name: 'Dual Separate Hoppers', description: 'Separates corrosive fertilizer granules from delicate crop seeds', x: 0.0, y: 0.6, z: 0.0 },
        { name: 'Precision Fluted Rollers', description: 'Prevents seed cracking for fragile pulses like soybean and gram', x: 0.0, y: 0.1, z: 0.5 },
        { name: 'Inverted-T Furrow Openers', description: 'Cuts clean slit in soil and drops seed directly on moist capillary layer', x: 0.0, y: -0.5, z: 0.7 },
      ],
    },
  },

  // 4. Harvesting: Multi-Crop Combine Harvester with Straw Management (SMS)
  {
    id: 'mac-harvester-04',
    name: 'Self-Propelled Multi-Crop Combine Harvester with SMS (Super SMS)',
    hindiName: 'सुपर एसएमएस कंबाइन हार्वेस्टर (धान व गेहूं कटाई मशीन)',
    marathiName: 'मल्टी-क्रॉप कंबाईन हार्वेस्टर (सुपर एस.एम.एस. सह)',
    stage: 'harvesting',
    stageLabel: 'Crop Cutting & Harvesting',
    hpRequired: '101 HP Ashok Leyland Turbo Diesel Engine',
    workingWidthOrCapacity: '14 Feet Cutter Bar (2.5 - 3.5 Acres/Hour)',
    hourlyRentalRate: 1850,
    perAcreRentalRate: 1750,
    rentalUnit: '₹1,850 / Hour (With Crew & Fuel)',
    description: 'High-capacity track or wheel combine that cuts, threshes, cleans, and loads grain directly into transport trolleys while Super SMS chops straw uniformly.',
    specifications: {
      'Cutter Bar Width': '4.2 Metres (14 Feet)',
      'Threshing Drum': 'Axial Flow rasp-bar with double concave adjustment',
      'Grain Tank Capacity': '2.2 Metric Tonnes (With rapid unloading auger)',
      'Straw Management': 'Govt. Certified Super SMS straw chopper and spreader',
      'Cleaning Area': 'Large vibrating double sieve with adjustable fan blast',
    },
    suitableCrops: ['Wheat', 'Paddy / Rice', 'Soybean', 'Gram / Chana', 'Mustard', 'Maize'],
    provider: {
      id: 'fleet-nsk-01',
      name: 'Panchavati Agro Harvester Syndicate',
      type: 'Private Agri Fleet',
      operatorName: 'Gurdeep Singh',
      operatorPhone: '+919814552211',
      hubLocation: 'Dindori Agro Hub, Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      distanceKm: 18.5,
      rating: 4.95,
      operatorIncluded: true,
      fuelIncluded: true,
    },
    model3DConfig: {
      primaryColor: '#eab308', // Harvester yellow
      accentColor: '#1e293b',
      geometryType: 'combine_harvester',
      wireframePolygons: 580,
      dimensions: [6.8, 3.8, 4.1],
      hotspots: [
        { name: '14ft Floating Cutter Bar', description: 'Cuts stalks within 4 cm of ground to capture low hanging grain pods', x: 2.2, y: -0.8, z: 0.0 },
        { name: 'Rotating Gathering Reel', description: 'Sweeps lodged or standing crop smoothly onto the intake conveyor', x: 2.0, y: -0.2, z: 0.0 },
        { name: 'Super SMS Straw Chopper', description: 'Chops straw into 2-inch mulch and spreads evenly across field (No residue burning)', x: -2.8, y: -0.5, z: 0.0 },
        { name: 'Grain Unloading Auger', description: 'Swings out 90° to fill farmer vehicle without stopping harvesting', x: 0.2, y: 1.6, z: 1.4 },
      ],
    },
  },

  // 5. Threshing: Multi-Crop High-Speed Axial Flow Thresher
  {
    id: 'mac-thresher-05',
    name: 'Multi-Crop Axial Flow Thresher with Hopper & Cleaning Blowers',
    hindiName: 'मल्टीक्रॉप एक्सियल फ्लो थ्रेशर (भूसा बनाने वाली थ्रेशिंग मशीन)',
    marathiName: 'मल्टीक्रॉप एक्सियल फ्लो थ्रेशर (कडबा व धान्य वेगळे करणारे)',
    stage: 'threshing',
    stageLabel: 'Threshing & Grain Separation',
    hpRequired: '35 – 50 HP Tractor PTO Driven',
    workingWidthOrCapacity: '1.5 – 2.5 Metric Tonnes grain output per hour',
    hourlyRentalRate: 750,
    rentalUnit: '₹750 / Hour',
    description: 'Tractor PTO-operated multi-crop thresher that separates clean grain from chaff with zero kernel breakage, while blowing fine cattle fodder (bhusa).',
    specifications: {
      'Drum Type': 'Axial Flow peg-tooth and beater cylinder',
      'Cleaning Blowers': 'Triple aspiration blowers with adjustable air damper',
      'Broken Grain Rate': '< 0.5% (Certified ICAR benchmark)',
      'Grain Cleaning Purity': '> 99.2% clean grain ready for APMC Mandi bag packing',
      'Interchangeable Sieves': 'Paddy, Wheat, Soybean, and Gram sieve kits included',
    },
    suitableCrops: ['Wheat', 'Paddy / Rice', 'Soybean', 'Gram / Chana', 'Tur / Arhar', 'Bajra', 'Jowar'],
    provider: {
      id: 'chc-sol-01',
      name: 'Solapur District Kisan Sangh CHC',
      type: 'Govt. Custom Hiring Centre (CHC)',
      operatorName: 'Mallappa Birajdar',
      operatorPhone: '+919822770022',
      hubLocation: 'Old MIDC Area, Solapur',
      district: 'Solapur',
      state: 'Maharashtra',
      distanceKm: 11.0,
      rating: 4.75,
      operatorIncluded: true,
      fuelIncluded: false,
    },
    model3DConfig: {
      primaryColor: '#0284c7', // Sky blue
      accentColor: '#f8fafc',
      geometryType: 'axial_thresher',
      wireframePolygons: 320,
      dimensions: [3.8, 1.9, 2.4],
      hotspots: [
        { name: 'Self-Feeding Intake Conveyor', description: 'Automatic hopper with reverse safety clutch prevents operator hand accidents', x: 1.2, y: 0.6, z: 0.0 },
        { name: 'Triple Air Blower Fans', description: 'Blows lightweight dust, chaff, and awns out into high-velocity straw duct', x: -0.6, y: 0.2, z: 0.0 },
        { name: 'Double Eccentric Sieve Box', description: 'Reciprocating sieves separate bold grain from unthreshed pods for re-circulation', x: 0.0, y: -0.6, z: 0.0 },
      ],
    },
  },

  // 6. Hulling & Processing: Modern Rubber Roll Paddy Huller & Rice Mill
  {
    id: 'mac-huller-06',
    name: 'Mobile Rubber-Roll Paddy Huller & Grain De-Husking Mill',
    hindiName: 'आधुनिक रबर रोल धान मिल व दाल डिहस्कर (हलर मशीन)',
    marathiName: 'आधुनिक रबर रोल भात गिरणी व कडधान्य पॉलिशर (हलर)',
    stage: 'hulling',
    stageLabel: 'De-Husking, Hulling & Milling',
    hpRequired: '15 HP 3-Phase Electric Motor OR 20 HP Tractor PTO',
    workingWidthOrCapacity: '800 – 1,200 kg Paddy / Pulses per hour',
    hourlyRentalRate: 600,
    perAcreRentalRate: undefined,
    rentalUnit: '₹600 / Hour OR ₹50 / Quintal Processed',
    description: 'Modern pneumatic rubber-roll huller that gently removes the tough outer husk from paddy and pulses with zero broken kernels, retaining whole nutritious bran.',
    specifications: {
      'Hulling Technology': 'Pneumatic differential speed rubber roller (No iron roller breakage)',
      'Hulling Efficiency': '90% – 95% single pass de-husking rate',
      'Head Rice Recovery': '68% – 72% whole intact kernels (vs 54% in old Engelberg hullers)',
      'Aspiration Chamber': 'Built-in centrifugal husk separator blows clean husk into bagging duct',
      'Versatility': 'Process Paddy, Arhar/Tur, Chana dal, Moong, and Urad into polished splits',
    },
    suitableCrops: ['Paddy / Rice', 'Tur / Arhar', 'Gram / Chana', 'Moong', 'Urad'],
    provider: {
      id: 'fpo-kol-01',
      name: 'Kolhapur Agro Processing Cooperative',
      type: 'Farmer Producer Company (FPO)',
      operatorName: 'Pandurang Mane',
      operatorPhone: '+919822883344',
      hubLocation: 'Shahupuri Market Extension, Kolhapur',
      district: 'Kolhapur',
      state: 'Maharashtra',
      distanceKm: 7.4,
      rating: 4.9,
      operatorIncluded: true,
      fuelIncluded: false,
    },
    model3DConfig: {
      primaryColor: '#7c3aed', // Purple / violet industrial
      accentColor: '#e2e8f0',
      geometryType: 'rice_huller',
      wireframePolygons: 280,
      dimensions: [2.2, 1.4, 2.3],
      hotspots: [
        { name: 'Differential Rubber Rollers', description: 'Counter-rotating high grip rubber cylinders strip the paddy husk without fracturing grain', x: 0.0, y: 0.3, z: 0.0 },
        { name: 'Aspiration Husk Separator', description: 'Draft suction fan removes light brown husk, sending it to bio-fuel or cattle feed duct', x: -0.6, y: 0.8, z: 0.0 },
        { name: 'Paddy Separator Table', description: 'Zig-zag oscillating gravity table sorts unhulled brown grain back to roller intake', x: 0.0, y: -0.4, z: 0.0 },
      ],
    },
  },

  // 7. Land Preparation: Laser Land Leveller
  {
    id: 'mac-laser-07',
    name: 'Precision Laser Land Leveller with Dual Slope Transmitter',
    hindiName: 'लेजर लैंड लेवलर (सटीक भूमि समतलीकरण मशीन)',
    marathiName: 'लेझर लँड लेव्हलर (अचूक जमीन सपाटीकरण यंत्र)',
    stage: 'land_prep',
    stageLabel: 'Land Preparation & Water Conservation',
    hpRequired: '50 – 60 HP Tractor with Dual Remote Valve',
    workingWidthOrCapacity: '2.1 Metres (7 Feet Bucket Width)',
    hourlyRentalRate: 1100,
    perAcreRentalRate: 1400,
    rentalUnit: '₹1,100 / Hour (With Laser Station & Operator)',
    description: 'Rotary laser controlled hydraulic scraper that levels fields within ±2 mm accuracy, reducing irrigation water requirement by 35% and boosting yields by 20%.',
    specifications: {
      'Operating Radius': '400 Metres laser transmitter signal radius',
      'Leveling Accuracy': '±2 mm over 100 Metres',
      'Hydraulic Control': 'Proportional hydraulic solenoid valve responding in 0.1 seconds',
      'Water Savings': 'Saves 35% irrigation water in flood / furrow systems',
      'Yield Increase': 'Uniform fertilizer and water distribution increases crop yield by 15-20%',
    },
    suitableCrops: ['Paddy / Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Vegetables'],
    provider: {
      id: 'chc-pun-02',
      name: 'Pune Agri Engineering Custom Centre',
      type: 'Govt. Custom Hiring Centre (CHC)',
      operatorName: 'Anil Gaikwad',
      operatorPhone: '+919822995511',
      hubLocation: 'Hadapsar Agro Mechanics Depot, Pune',
      district: 'Pune',
      state: 'Maharashtra',
      distanceKm: 9.8,
      rating: 4.9,
      operatorIncluded: true,
      fuelIncluded: true,
    },
    model3DConfig: {
      primaryColor: '#ea580c', // Safety Orange
      accentColor: '#0f172a',
      geometryType: 'laser_leveller',
      wireframePolygons: 310,
      dimensions: [3.9, 2.2, 3.2],
      hotspots: [
        { name: 'Rotary Laser Receiver Mast', description: 'Mounts on scraper mast; intercepts 360° laser sweep 10 times per second', x: 0.0, y: 1.5, z: 0.0 },
        { name: 'Laser Transmitter Tripod', description: 'Erected at field corner; emits rotating invisible infrared laser grade plane', x: 1.8, y: 0.8, z: 1.2 },
        { name: 'Curved Hydraulic Scraper Bucket', description: 'Heavy steel scraper cuts soil from high spots and deposits in low depressions', x: -0.6, y: -0.4, z: 0.0 },
      ],
    },
  },

  // 8. Crop Protection: Tractor-Mounted Boom Sprayer (400 Litres)
  {
    id: 'mac-sprayer-08',
    name: 'Tractor-Mounted 400L Boom Sprayer (12-Metre Hydraulic Boom)',
    hindiName: 'ट्रैक्टर माउंटेड बूम स्प्रेयर (400 लीटर क्षमता, 12 मीटर चौड़ाई)',
    marathiName: 'ट्रॅक्टर माउंटेड बूम स्प्रेअर (४०० लिटर, १२ मीटर बूम)',
    stage: 'protection',
    stageLabel: 'Foliar Spraying & Crop Protection',
    hpRequired: '30 – 40 HP Tractor PTO',
    workingWidthOrCapacity: '12 Metres (Covering 24 Rows Simultaneously)',
    hourlyRentalRate: 550,
    perAcreRentalRate: 400,
    rentalUnit: '₹550 / Hour (Can spray 6 acres/hour)',
    description: 'High-speed tractor PTO boom sprayer covering 12 metres in a single sweep with anti-drip ceramic nozzles for uniform foliar pest and nutrient spraying.',
    specifications: {
      'Tank Capacity': '400 Litres UV-stabilized polyethylene tank with chemical inductor',
      'Boom Width': '12 Metres folding steel boom with hydraulic height control',
      'Nozzles': '24 Anti-drip ceramic hollow-cone and flat-fan nozzles',
      'Pump': 'Italian 3-diaphragm pump (55 Litres/minute at 20 bar pressure)',
      'Field Capacity': '6 – 8 Acres per hour',
    },
    suitableCrops: ['Cotton', 'Soybean', 'Wheat', 'Gram / Chana', 'Onion', 'Potato', 'Sugarcane'],
    provider: {
      id: 'fpo-brm-02',
      name: 'Nira Valley Farmer Producer Company',
      type: 'Farmer Producer Company (FPO)',
      operatorName: 'Vitthal Kadam',
      operatorPhone: '+919822441133',
      hubLocation: 'Baramati MIDC Agro Hub, Pune',
      district: 'Pune',
      state: 'Maharashtra',
      distanceKm: 13.0,
      rating: 4.8,
      operatorIncluded: true,
      fuelIncluded: false,
    },
    model3DConfig: {
      primaryColor: '#16a34a', // Leaf green
      accentColor: '#f1f5f9',
      geometryType: 'boom_sprayer',
      wireframePolygons: 360,
      dimensions: [3.1, 4.2, 2.1],
      hotspots: [
        { name: '400L Polyethylene Tank', description: 'Internal hydraulic agitator prevents chemical settling or separation', x: 0.0, y: 0.4, z: 0.0 },
        { name: '12-Metre Folding Boom Wings', description: 'Spring-loaded breakaway wings fold back if tree or boundary is encountered', x: 0.0, y: 0.1, z: 1.8 },
        { name: 'Ceramic Anti-Drip Nozzles', description: 'Even flat fan spray pattern with diaphragm check valve preventing post-spray dripping', x: 0.0, y: -0.3, z: 1.5 },
      ],
    },
  },
];

