import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME,
  isThemeMode,
  persistTheme,
  readStoredTheme,
  THEME_STORAGE_KEY,
} from '../../src/ui/preferences';

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    valueFor: (key: string) => values.get(key) ?? null,
  };
}

describe('theme preferences', () => {
  it('defaults to the original paper theme', () => {
    expect(readStoredTheme(null)).toBe(DEFAULT_THEME);
    expect(readStoredTheme(createStorage())).toBe(DEFAULT_THEME);
  });

  it('accepts only the supported theme modes', () => {
    expect(isThemeMode('paper')).toBe(true);
    expect(isThemeMode('light')).toBe(true);
    expect(isThemeMode('dark')).toBe(true);
    expect(isThemeMode('system')).toBe(false);
  });

  it('persists and restores a selected theme', () => {
    const storage = createStorage();
    persistTheme(storage, 'dark');

    expect(storage.valueFor(THEME_STORAGE_KEY)).toBe('dark');
    expect(readStoredTheme(storage)).toBe('dark');
  });

  it('falls back when storage contains an unsupported value', () => {
    expect(readStoredTheme(createStorage({ [THEME_STORAGE_KEY]: 'system' }))).toBe(DEFAULT_THEME);
  });
});
