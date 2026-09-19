import type { Locale } from '../../shared/contracts';
import countriesEn from '../../content/puzzles/en/countries-continent-2026-09-01-en.json';
import countriesZh from '../../content/puzzles/zh-Hans/countries-continent-2026-09-01-zh-Hans.json';
import countriesEs from '../../content/puzzles/es-419/countries-continent-2026-09-01-es-419.json';
import animalsEn from '../../content/puzzles/en/animals-class-2026-09-02-en.json';
import animalsZh from '../../content/puzzles/zh-Hans/animals-class-2026-09-02-zh-Hans.json';
import animalsEs from '../../content/puzzles/es-419/animals-class-2026-09-02-es-419.json';
import instrumentsEn from '../../content/puzzles/en/instruments-family-2026-09-03-en.json';
import instrumentsZh from '../../content/puzzles/zh-Hans/instruments-family-2026-09-03-zh-Hans.json';
import instrumentsEs from '../../content/puzzles/es-419/instruments-family-2026-09-03-es-419.json';

export interface ArchivePuzzle {
  readonly publishDate: string;
  readonly theme: string;
  readonly items: readonly { readonly itemId: string; readonly label: string }[];
  readonly solution: {
    readonly hiddenDimension: string;
    readonly groups: readonly { readonly label: string; readonly capacity: number; readonly itemIds: readonly string[] }[];
  };
  readonly explanation: string;
  readonly sources: readonly { readonly title: string; readonly url: string }[];
}

// Explicit editorial selection, never glob the scheduled puzzle catalog.
// This module is server-only: gameplay must not import it.
export const archiveCatalog: Readonly<Record<string, Readonly<Record<Locale, ArchivePuzzle>>>> = {
  countries: { en: countriesEn, 'zh-Hans': countriesZh, 'es-419': countriesEs },
  animals: { en: animalsEn, 'zh-Hans': animalsZh, 'es-419': animalsEs },
  instruments: { en: instrumentsEn, 'zh-Hans': instrumentsZh, 'es-419': instrumentsEs },
};

export function releasedArticles(locale: Locale, now: Date): readonly [string, ArchivePuzzle][] {
  const today = now.toISOString().slice(0, 10);
  return Object.entries(archiveCatalog)
    .map(([slug, localized]): [string, ArchivePuzzle] => [slug, localized[locale]])
    .filter(([, puzzle]) => puzzle.publishDate < today);
}

export const editorialReferences: Readonly<Record<string, readonly { readonly title: string; readonly url: string }[]>> = {
  countries: [],
  animals: [
    { title: 'Smithsonian Ocean — Penguins', url: 'https://ocean.si.edu/ocean-life/seabirds/penguins' },
    { title: 'Smithsonian Ocean — Whales and dolphins', url: 'https://ocean.si.edu/ocean-life/marine-mammals/whales' },
    { title: 'OpenStax Biology — Reptiles', url: 'https://openstax.org/books/biology/pages/29-4-reptiles' },
  ],
  instruments: [
    { title: 'Carnegie Hall — Instrument families', url: 'https://www.carnegiehall.org/Education/Programs/Link-Up/New-York-City/Instrument-Families' },
    { title: 'Carnegie Hall — Flute', url: 'https://orchestramap.carnegiehall.org/?active=flute&mapType=instruments' },
  ],
};
