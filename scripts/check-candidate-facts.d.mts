import type { AuthoringPuzzleRecord } from '../src/domain/puzzle/authoring';
export function checkPuzzleFacts(puzzle: AuthoringPuzzleRecord): { items: number; status: 'author-factual-check-only' };
export function checkCandidateFacts(root?: string): Promise<{ families: number; puzzles: number; items: number; status: 'author-factual-check-only'; blindPlaytest: 'pending' }>;
