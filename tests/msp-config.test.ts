import { describe, it, expect } from 'vitest';
import { getMSPForCommodity, OFFICIAL_MSP_CONFIG } from '@/lib/msp-config';

describe('MSP Configuration & Grounding (H14)', () => {
  it('contains valid CACP crop configurations with validity seasons', () => {
    expect(OFFICIAL_MSP_CONFIG.length).toBeGreaterThanOrEqual(10);
    for (const record of OFFICIAL_MSP_CONFIG) {
      expect(record.commodity).toBeTruthy();
      expect(record.season).toBeTruthy();
      expect(record.validitySeason).toBeTruthy();
      expect(record.mspPerQuintal).toBeGreaterThan(0);
    }
  });

  it('resolves MSP by crop name and multi-lingual aliases', () => {
    const wheat = getMSPForCommodity('Wheat (गेहूं)');
    expect(wheat).toBeDefined();
    expect(wheat?.commodity).toBe('Wheat');
    expect(wheat?.mspPerQuintal).toBe(2275);
    expect(wheat?.validitySeason).toContain('2024-25');

    const tur = getMSPForCommodity('तूर डाळ');
    expect(tur).toBeDefined();
    expect(tur?.commodity).toBe('Tur / Arhar');
    expect(tur?.mspPerQuintal).toBe(7550);

    const soybean = getMSPForCommodity('सोयाबीन');
    expect(soybean).toBeDefined();
    expect(soybean?.commodity).toBe('Soybean (Yellow)');
    expect(soybean?.mspPerQuintal).toBe(4892);
  });
});

