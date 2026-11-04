import { describe, it, expect } from 'vitest';
import { scaleDosage, getCropCareForCrop } from '@/lib/crop-care-data';
import { FARM_MACHINERY_CATALOG } from '@/lib/machinery-data';

describe('Change 3: Exact Land Size Dosage Calculation', () => {
  it('returns original dosage when acres is 1', () => {
    const wheatCare = getCropCareForCrop('wheat');
    const original = wheatCare.fertilizerAdvisory.organicOption.dosagePerAcre;
    expect(scaleDosage(original, 1)).toBe(original);
  });

  it('accurately scales integer quantities for decimal acreage (e.g. 3.7 acres)', () => {
    const baseDosage = '2.5 Tonnes FYM + 400 kg Vermicompost + 2 kg Azotobacter';
    const scaled = scaleDosage(baseDosage, 3.7);

    // 2.5 * 3.7 = 9.25 Tonnes
    // 400 * 3.7 = 1480 kg
    // 2 * 3.7 = 7.4 kg
    expect(scaled).toBe('9.25 Tonnes FYM + 1480 kg Vermicompost + 7.4 kg Azotobacter');
  });

  it('accurately scales decimal acreage e.g. 12.25 acres', () => {
    const baseDosage = '200 ml Propiconazole + 40 g Thiamethoxam in 180 Litres water per acre';
    const scaled = scaleDosage(baseDosage, 12.25);

    // 200 * 12.25 = 2450 ml
    // 40 * 12.25 = 490 g
    // 180 * 12.25 = 2205 Litres
    expect(scaled).toBe('2450 ml Propiconazole + 490 g Thiamethoxam in 2205 Litres water per acre');
  });

  it('preserves NPK ratios (e.g. 10:26:26), split counts (2 splits), and days without scaling', () => {
    const complexDosage = '65 kg 10:26:26 + 15 kg MgSO4 (Basal); 70 kg Urea split in 2 splits at 30, 60 & 90 DAS; 250 g Boron foliar';
    const scaled = scaleDosage(complexDosage, 2);

    // 65 * 2 = 130 kg
    // 10:26:26 preserved
    // 15 * 2 = 30 kg
    // 70 * 2 = 140 kg
    // in 2 splits preserved
    // 30, 60 & 90 DAS preserved
    // 250 * 2 = 500 g
    expect(scaled).toContain('130 kg 10:26:26');
    expect(scaled).toContain('30 kg MgSO4');
    expect(scaled).toContain('140 kg Urea split in 2 splits at 30, 60 & 90 DAS');
    expect(scaled).toContain('500 g Boron foliar');
  });

  it('preserves fixed seed treatment baselines like per 35 kg seed', () => {
    const seedDosage = '250 g Rhizobium + 250 g PSB per 35 kg seed + 500 kg Phospho-compost';
    const scaled = scaleDosage(seedDosage, 3);

    expect(scaled).toContain('750 g Rhizobium');
    expect(scaled).toContain('750 g PSB per 35 kg seed');
    expect(scaled).toContain('1500 kg Phospho-compost');
  });

  it('handles invalid or non-positive acreage safely by returning original text', () => {
    const original = '100 kg SSP + 20 kg MOP';
    expect(scaleDosage(original, 0)).toBe(original);
    expect(scaleDosage(original, -2.5)).toBe(original);
    expect(scaleDosage(original, NaN)).toBe(original);
  });
});

describe('Change 2: Machinery Listing with Direct Owner Contact Details', () => {
  it('ensures every machine in catalog has complete owner & operator contact fields', () => {
    FARM_MACHINERY_CATALOG.forEach((machine) => {
      expect(machine.id).toBeTruthy();
      expect(machine.name).toBeTruthy();
      expect(machine.hourlyRentalRate).toBeGreaterThan(0);
      expect(machine.stage).toBeTruthy();
      expect(machine.stageLabel).toBeTruthy();
      expect(machine.description).toBeTruthy();

      // Owner details
      expect(machine.provider.operatorName).toBeTruthy();
      expect(machine.provider.operatorPhone).toMatch(/^\+91\s?\d{5}\s?\d{5}$/);
      expect(machine.provider.name).toBeTruthy();
      expect(machine.provider.hubLocation).toBeTruthy();
      expect(machine.provider.distanceKm).toBeGreaterThan(0);
    });
  });
});

