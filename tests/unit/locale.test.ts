import { describe, expect, it } from 'vitest';
import { normalizeLocale, SUPPORTED_LOCALES } from '../../shared/contracts';

describe('normalizeLocale', () => {
  it('accepts every supported locale unchanged', () => {
    for (const locale of SUPPORTED_LOCALES) expect(normalizeLocale(locale)).toBe(locale);
  });

  it('maps the retired zh-Hans code to zh-Hant for old links and saved preferences', () => {
    expect(normalizeLocale('zh-Hans')).toBe('zh-Hant');
  });

  it('rejects unknown or empty values', () => {
    expect(normalizeLocale('fr')).toBeNull();
    expect(normalizeLocale('')).toBeNull();
    expect(normalizeLocale(null)).toBeNull();
  });
});
