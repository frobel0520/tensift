import type { AuthoringPuzzleRecord } from './authoring';
export interface PuzzleValidationIssue {
    readonly path: string;
    readonly code: string;
    readonly message: string;
}
export interface PuzzleValidationResult {
    readonly valid: boolean;
    readonly issues: readonly PuzzleValidationIssue[];
}
export declare function validateAuthoringPuzzle(value: unknown): PuzzleValidationResult;
export declare function assertValidAuthoringPuzzle(value: unknown, sourceLabel: string): asserts value is AuthoringPuzzleRecord;
