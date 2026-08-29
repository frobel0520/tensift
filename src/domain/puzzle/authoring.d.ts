import type { Locale, RowCapacity, RowId } from '../../../shared/contracts';
export type PuzzleStatus = 'draft' | 'reviewed' | 'scheduled' | 'published' | 'retired';
export type DifficultyBand = 'easy' | 'medium' | 'hard';
export interface AuthoringVisual {
    readonly type: 'emoji' | 'image';
    readonly src: string;
    readonly altText: string;
}
export interface AuthoringPuzzleItem {
    readonly itemId: string;
    readonly label: string;
    readonly visual?: AuthoringVisual;
    readonly rightsNote?: string;
}
export interface AuthoringPuzzleRow {
    readonly rowId: RowId;
    readonly capacity: RowCapacity;
}
export interface AuthoringSolutionGroup {
    readonly groupId: string;
    readonly label: string;
    readonly capacity: RowCapacity;
    readonly itemIds: readonly string[];
}
export interface AuthoringSolution {
    readonly hiddenDimension: string;
    readonly groups: readonly AuthoringSolutionGroup[];
}
export interface AuthoringSource {
    readonly title: string;
    readonly url: string;
    readonly retrievedAt: string;
}
export interface AuthoringDifficulty {
    readonly band: DifficultyBand;
    readonly score: number;
    readonly notes?: string;
}
export interface AuthoringPuzzleRecord {
    readonly schemaVersion: 1;
    readonly puzzleId: string;
    readonly puzzleFamilyId: string;
    readonly locale: Locale;
    readonly publishDate: string;
    readonly timezone: 'UTC';
    readonly theme: string;
    readonly items: readonly AuthoringPuzzleItem[];
    readonly rows: readonly AuthoringPuzzleRow[];
    readonly solution: AuthoringSolution;
    readonly hint: {
        readonly maxUses: 1;
        readonly policy: 'random-unlocked-correct-row';
    };
    readonly explanation: string;
    readonly sources: readonly AuthoringSource[];
    readonly difficulty: AuthoringDifficulty;
    readonly status: PuzzleStatus;
}
