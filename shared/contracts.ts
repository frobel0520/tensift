export const SUPPORTED_LOCALES = ['en', 'zh-Hant', 'es-419'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Chinese content moved from Simplified (zh-Hans) to Traditional (zh-Hant); old links and saved preferences map forward. */
export const LEGACY_LOCALE_ALIASES: Readonly<Record<string, Locale>> = { 'zh-Hans': 'zh-Hant' };

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  if ((SUPPORTED_LOCALES as readonly string[]).includes(value)) return value as Locale;
  return LEGACY_LOCALE_ALIASES[value] ?? null;
}
export type RowCapacity = 1 | 2 | 3 | 4;
export type RowId = `row-${1 | 2 | 3 | 4}`;

export interface SafePuzzleItem {
  readonly itemId: string;
  readonly label: string;
  readonly visual?: {
    readonly type: 'emoji' | 'image';
    readonly src: string;
    readonly altText: string;
  };
}

export interface SafePuzzleDto {
  readonly puzzleId: string;
  readonly publishDate: string;
  readonly locale: Locale;
  readonly theme: string;
  readonly items: readonly SafePuzzleItem[];
  readonly rows: readonly { rowId: RowId; capacity: RowCapacity }[];
  readonly policy: { maxHints: 1; checks: 'unlimited' };
}

export interface Placement {
  readonly itemId: string;
  readonly rowId: RowId;
}

export interface CheckRequest {
  readonly clientSessionId: string;
  readonly placements: readonly Placement[];
}

export interface CheckResponse {
  readonly correctCount: number;
  readonly solved: boolean;
  readonly attemptAccepted: true;
}

export interface HintRequest {
  readonly clientSessionId: string;
  readonly idempotencyKey: string;
  /** Optional client snapshot used to avoid hinting an already-correct item. */
  readonly placements?: readonly Placement[];
  /** Optional locked item IDs restored from the local session. */
  readonly lockedItemIds?: readonly string[];
}

export interface HintResponse {
  readonly itemId: string;
  readonly rowId: RowId;
  readonly hintAccepted: true;
}

export interface RevealResponse {
  readonly hiddenDimension: string;
  readonly groups: readonly {
    readonly label: string;
    readonly capacity: RowCapacity;
    readonly itemIds: readonly string[];
  }[];
  readonly explanation: string;
  readonly sources: readonly { title: string; url: string }[];
}

export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly requestId: string;
}
