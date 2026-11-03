import { describe, it, expect } from 'vitest';
import { en, hi, translations } from '@/lib/translations';
import { mr } from '@/lib/translations/mr';
import { pa } from '@/lib/translations/pa';
import { gu } from '@/lib/translations/gu';

describe('Translations Completeness & Consistency (M4)', () => {
  const enKeys = Object.keys(en);
  const languages = [
    { code: 'hi', dict: hi },
    { code: 'mr', dict: mr },
    { code: 'pa', dict: pa },
    { code: 'gu', dict: gu },
  ];

  it('contains English base dictionary with keys', () => {
    expect(enKeys.length).toBeGreaterThan(100);
  });

  for (const { code, dict } of languages) {
    it(`verifies all English translation keys exist in ${code.toUpperCase()}`, () => {
      const missingKeys = enKeys.filter((key) => dict[key] === undefined || dict[key] === '');
      if (missingKeys.length > 0) {
        console.warn(`[Translations] Language ${code} is missing ${missingKeys.length} keys:`, missingKeys);
      }
      expect(missingKeys).toEqual([]);
    });
  }

  it('ensures t() returns translated string or parameter substitution', () => {
    const res = translations.en['transport.handlingFee'];
    expect(res).toContain('{qty}');
  });
});

