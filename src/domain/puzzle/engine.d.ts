import type { RowId } from '../../../shared/contracts';
import type { AuthoringPuzzleRecord } from './authoring';
export type PlacementIssueCode = 'unknown-row' | 'row-over-capacity' | 'duplicate-item' | 'unknown-item' | 'board-incomplete';
export interface PlacementIssue {
    readonly code: PlacementIssueCode;
    readonly itemId?: string;
    readonly rowId?: string;
}
export interface PlacementEvaluation {
    readonly complete: boolean;
    readonly correctCount: number;
    readonly solved: boolean;
    readonly issues: readonly PlacementIssue[];
}
export interface HintCandidate {
    readonly itemId: string;
    readonly rowId: RowId;
}
export type RandomIndex = (maxExclusive: number) => number;
export declare function evaluatePlacements(puzzle: AuthoringPuzzleRecord, placements: ReadonlyMap<string, readonly string[]>): PlacementEvaluation;
export declare function chooseHintCandidate(puzzle: AuthoringPuzzleRecord, placements: ReadonlyMap<string, readonly string[]>, lockedItemIds: ReadonlySet<string>, randomIndex?: RandomIndex): HintCandidate | null;
