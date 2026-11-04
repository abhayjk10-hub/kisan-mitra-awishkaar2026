import { describe, it, expect } from 'vitest';
import {
  getStorageRecommendationForCrop,
  getStorageFacilities,
} from '@/lib/cold-storage-service';
import {
  calculateTripDetails,
  createVehicleBooking,
} from '@/lib/transport-booking-service';
import {
  getCropCareForCrop,
} from '@/lib/crop-care-data';
import { FARM_MACHINERY_CATALOG } from '@/lib/machinery-data';
import { OFFICIAL_KISAN_SCHEMES } from '@/lib/schemes-data';

describe('Feature 1: Cold Storage & Warehouse Advisory', () => {
  it('correctly recommends cold storage for perishable tomato with scientific explanation', () => {
    const rec = getStorageRecommendationForCrop('Tomato');
    expect(rec.recommendedType).toBe('cold_storage');
    expect(rec.idealTemp).toContain('°C');
    expect(rec.idealHumidity).toContain('%');
    expect(rec.reason).toContain('moisture');
    expect(rec.benefits.length).toBeGreaterThan(0);
    expect(rec.risksIfStoredWrong).toContain('spoilage');
  });

  it('correctly recommends normal dry warehouse for wheat to save storage costs', () => {
    const rec = getStorageRecommendationForCrop('Wheat');
    expect(rec.recommendedType).toBe('dry_warehouse');
    expect(rec.reason).toContain('expensive cold storage');
    expect(rec.benefits.some((b) => b.includes('e-NWR') || b.includes('economical'))).toBe(true);
  });

  it('correctly recommends specialized ventilated storage for onion to prevent sprouting', () => {
    const rec = getStorageRecommendationForCrop('Onion');
    expect(rec.recommendedType).toBe('cold_storage');
    expect(rec.reason).toContain('sprout');
  });

  it('calculates straight-line distance and sorts storage facilities by proximity', () => {
    const puneLat = 18.4907;
    const puneLng = 73.8615;
    const facilities = getStorageFacilities(puneLat, puneLng, 'all');

    expect(facilities.length).toBeGreaterThan(0);
    expect(facilities[0].distance_km).toBeDefined();
    // Proximity sorting test
    for (let i = 0; i < facilities.length - 1; i++) {
      expect(facilities[i].distance_km!).toBeLessThanOrEqual(facilities[i + 1].distance_km!);
    }
  });

  it('filters facilities accurately by cold_storage vs dry_warehouse', () => {
    const coldOnly = getStorageFacilities(undefined, undefined, 'cold_storage');
    expect(coldOnly.every((f) => f.type === 'cold_storage' || f.type === 'controlled_atmosphere')).toBe(true);

    const dryOnly = getStorageFacilities(undefined, undefined, 'dry_warehouse');
    expect(dryOnly.every((f) => f.type === 'dry_warehouse')).toBe(true);
  });
});

describe('Feature 2: Vehicle Transportation Booking (Demonstration)', () => {
  it('calculates consistent trip distance, cost per quintal, and ETA', () => {
    const trip = calculateTripDetails(18.5204, 73.8567, 'a1b2c3d4-e5f6-7890-abcd-111111111111', 25, 'pickup');
    expect(trip.distanceKm).toBeGreaterThan(0);
    expect(trip.totalCost).toBeGreaterThan(0);
    expect(trip.costPerQuintal).toBeGreaterThan(0);
    expect(trip.costPerQuintal * 25).toBeCloseTo(trip.totalCost, -1);
    expect(trip.estimatedTransitMinutes).toBeGreaterThan(20);
  });

  it('generates a full vehicle booking token with agency, driver, license plate, and format TRK-MH-...', () => {
    const booking = createVehicleBooking({
      farmerName: 'Dnyandev Patil',
      farmerPhone: '9822019988',
      pickupLocation: 'Haveli Farm Hub, Pune',
      destinationMandiId: 'a1b2c3d4-e5f6-7890-abcd-111111111111',
      cropName: 'Soybean',
      quantityQuintals: 30,
      vehicleType: 'pickup',
    });

    expect(booking.tokenNumber).toMatch(/^TRK-MH-2026-\d{4}$/);
    expect(booking.farmerName).toBe('Dnyandev Patil');
    expect(booking.farmerPhone).toBe('9822019988');
    expect(booking.vehicleNumber).toMatch(/^MH-\d{2}-[A-Z]{2}-\d{4}$/);
    expect(booking.driverName).toBeDefined();
    expect(booking.driverPhone).toBeDefined();
    expect(booking.agencyName).toBeDefined();
    expect(booking.status).toBe('assigned');
    expect(booking.costPerQuintal).toBeGreaterThan(0);
  });
});

describe('Features 3 & 4: Fertilizers & Pesticides Advisory', () => {
  it('covers all major app crops with both organic and inorganic options', () => {
    const sampleCrops = ['wheat', 'paddy', 'soyabean', 'cotton', 'onion', 'tomato', 'potato', 'chana', 'maize', 'sugarcane'];

    sampleCrops.forEach((cropId) => {
      const care = getCropCareForCrop(cropId);
      expect(care).toBeDefined();

      // Fertilizer tests
      expect(care.fertilizerAdvisory.organicOption).toBeDefined();
      expect(care.fertilizerAdvisory.organicOption.suitabilityScore).toBeGreaterThanOrEqual(70);
      expect(care.fertilizerAdvisory.organicOption.priceEstimate).toBeDefined();
      expect(care.fertilizerAdvisory.inorganicOption).toBeDefined();
      expect(care.fertilizerAdvisory.inorganicOption.suitabilityScore).toBeGreaterThanOrEqual(70);
      expect(care.fertilizerAdvisory.inorganicOption.composition).toBeDefined();

      // Pesticide tests
      expect(care.pesticideAdvisory.targetPests.length).toBeGreaterThan(0);
      expect(care.pesticideAdvisory.organicOption).toBeDefined();
      expect(care.pesticideAdvisory.organicOption.preHarvestIntervalDays).toBeDefined();
      expect(care.pesticideAdvisory.chemicalOption).toBeDefined();
      expect(care.pesticideAdvisory.chemicalOption.preHarvestIntervalDays).toBeGreaterThan(0);
      expect(care.pesticideAdvisory.chemicalOption.safetyPrecautions.length).toBeGreaterThan(0);
    });
  });

  it('correctly maps partial queries like rice to paddy care', () => {
    const care = getCropCareForCrop('rice');
    expect(care.id).toBe('paddy');
  });
});

describe('Feature 5: Farm Machinery Rental & 3D Config', () => {
  it('contains machinery for every major farming stage including hulling', () => {
    const stages = FARM_MACHINERY_CATALOG.map((m) => m.stage);
    expect(stages).toContain('ploughing');
    expect(stages).toContain('sowing');
    expect(stages).toContain('harvesting');
    expect(stages).toContain('threshing');
    expect(stages).toContain('hulling'); // Hulling explicitly required by prompt
    expect(stages).toContain('land_prep');
    expect(stages).toContain('protection');
  });

  it('includes realistic hourly rental rates, provider details, and 3D hotspots', () => {
    FARM_MACHINERY_CATALOG.forEach((machine) => {
      expect(machine.hourlyRentalRate).toBeGreaterThan(300);
      expect(machine.hourlyRentalRate).toBeLessThan(3000);
      expect(machine.provider.name).toBeDefined();
      expect(machine.provider.operatorPhone).toBeDefined();
      expect(machine.model3DConfig.hotspots.length).toBeGreaterThanOrEqual(2);
      expect(machine.model3DConfig.dimensions.length).toBe(3);
    });
  });

  it('verifies rice huller machine specifications', () => {
    const huller = FARM_MACHINERY_CATALOG.find((m) => m.stage === 'hulling');
    expect(huller).toBeDefined();
    expect(huller?.name).toContain('Huller');
    expect(huller?.suitableCrops).toContain('Paddy / Rice');
  });
});

describe('Feature 6: Kisan Insurance & Schemes', () => {
  it('contains all core official schemes with valid HTTPS official portals', () => {
    const acronyms = OFFICIAL_KISAN_SCHEMES.map((s) => s.acronym);
    expect(acronyms).toContain('PMFBY');
    expect(acronyms).toContain('AB-PMJAY');
    expect(acronyms).toContain('KCC');
    expect(acronyms).toContain('PM-KISAN');
    expect(acronyms).toContain('PM-KUSUM');
    expect(acronyms).toContain('AIF');
    expect(acronyms).toContain('PM-KMY');

    OFFICIAL_KISAN_SCHEMES.forEach((scheme) => {
      expect(scheme.officialPortalUrl).toMatch(/^https:\/\//);
      expect(scheme.keyBenefits.length).toBeGreaterThan(0);
      expect(scheme.eligibilityCriteria.length).toBeGreaterThan(0);
      expect(scheme.documentsRequired.length).toBeGreaterThan(0);
      expect(scheme.helplinePhone).toBeDefined();
    });
  });
});
