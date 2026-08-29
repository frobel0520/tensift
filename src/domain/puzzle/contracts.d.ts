import type { Locale, RowCapacity, RowId } from '../../../shared/contracts';
export interface PuzzleRow {
    readonly rowId: RowId;
    readonly capacity: RowCapacity;
}
export interface PuzzleReference {
    readonly puzzleId: string;
    readonly locale: Locale;
    readonly itemIds: readonly string[];
    readonly rows: readonly PuzzleRow[];
}
export declare function isCompletePlacement(placements: ReadonlyMap<RowId, readonly string[]>, puzzle: PuzzleReference): boolean;
