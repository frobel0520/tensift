export declare const SUPPORTED_LOCALES: readonly ["en", "zh-Hant", "es-419"];
export type Locale = (typeof SUPPORTED_LOCALES)[number];
/** Chinese content moved from Simplified (zh-Hans) to Traditional (zh-Hant); old links and saved preferences map forward. */
export declare const LEGACY_LOCALE_ALIASES: Readonly<Record<string, Locale>>;
export declare function normalizeLocale(value: string | null | undefined): Locale | null;
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
    readonly rows: readonly {
        rowId: RowId;
        capacity: RowCapacity;
    }[];
    readonly policy: {
        maxHints: 1;
        checks: 'unlimited';
    };
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
    readonly sources: readonly {
        title: string;
        url: string;
    }[];
}
export interface ApiErrorBody {
    readonly code: string;
    readonly message: string;
    readonly requestId: string;
}
