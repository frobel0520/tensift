export const SUPPORTED_LOCALES = ['en', 'zh-Hant', 'es-419'];
export const LEGACY_LOCALE_ALIASES = { 'zh-Hans': 'zh-Hant' };
export function normalizeLocale(value) {
    if (!value)
        return null;
    if (SUPPORTED_LOCALES.includes(value))
        return value;
    return LEGACY_LOCALE_ALIASES[value] ?? null;
}
