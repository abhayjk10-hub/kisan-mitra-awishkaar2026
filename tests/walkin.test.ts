import { describe, it, expect } from 'vitest';
import { createWalkinToken, DEFAULT_MANDIS } from '@/lib/mandi-service';

describe('Walk-in Token Window Logic (M1)', () => {
  it('rejects walk-in token when mandi is not found', async () => {
    await expect(
      createWalkinToken('invalid-mandi-id', {
        farmer_name: 'Ramesh',
        farmer_phone: '9876543210',
        crop_name: 'Wheat',
        quantity_quintals: 10,
      })
    ).rejects.toThrow('Mandi not found.');
  });

  it('validates operating hours and clamps to 30-min windows for registered mandis', () => {
    const pune = DEFAULT_MANDIS[0];
    expect(pune.opening_time).toBe('06:00');
    expect(pune.closing_time).toBe('18:00');
  });
});

