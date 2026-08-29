export const THEME_STORAGE_KEY = 'tensift:theme';

export const SUPPORTED_THEMES = ['paper', 'light', 'dark'] as const;

export type ThemeMode = typeof SUPPORTED_THEMES[number];

export const DEFAULT_THEME: ThemeMode = 'paper';

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function isThemeMode(value: string): value is ThemeMode {
  return (SUPPORTED_THEMES as readonly string[]).includes(value);
}

export function readStoredTheme(storage: PreferenceStorage | null): ThemeMode {
  if (!storage) {
    return DEFAULT_THEME;
  }

  try {
    const storedTheme = storage.getItem(THEME_STORAGE_KEY);
    return storedTheme && isThemeMode(storedTheme) ? storedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function persistTheme(storage: PreferenceStorage | null, theme: ThemeMode): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Preferences are optional and should never block gameplay.
  }
}
