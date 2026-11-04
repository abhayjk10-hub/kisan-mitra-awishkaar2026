import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
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

  it('verifies all t() calls in src/ are defined in English dictionary', () => {
    const enKeySet = new Set(enKeys);
    const scannedKeys = new Set<string>();

    function walkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.next') {
            walkDir(full);
          }
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          if (!full.includes('translations') && !full.includes('tests')) {
            const content = fs.readFileSync(full, 'utf8');
            const regex = /\bt\(\s*['"]([a-zA-Z0-9_\.]+)['"]/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
              scannedKeys.add(match[1]);
            }
          }
        }
      }
    }

    walkDir(path.resolve(__dirname, '../src'));
    const missingKeys = Array.from(scannedKeys).filter((k) => !enKeySet.has(k));
    if (missingKeys.length > 0) {
      console.warn(`[Translations] Found ${missingKeys.length} keys used in codebase missing from en:`, missingKeys);
    }
    expect(missingKeys).toEqual([]);
  });
});


