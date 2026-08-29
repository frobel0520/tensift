import type { RowCapacity, RowId } from '../../../shared/contracts';
import type { AuthoringPuzzleRecord } from './authoring';

export type PlacementIssueCode =
  | 'unknown-row'
  | 'row-over-capacity'
  | 'duplicate-item'
  | 'unknown-item'
  | 'board-incomplete';

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

export function evaluatePlacements(
  puzzle: AuthoringPuzzleRecord,
  placements: ReadonlyMap<string, readonly string[]>,
): PlacementEvaluation {
  const rowById = new Map<string, (typeof puzzle.rows)[number]>(
    puzzle.rows.map((row) => [row.rowId, row]),
  );
  const solutionByItem = createSolutionIndex(puzzle);
  const issues: PlacementIssue[] = [];
  const placedItemIds: string[] = [];
  let correctCount = 0;

  for (const [rowId, rowItems] of placements) {
    const row = rowById.get(rowId);
    if (!row) {
      issues.push({ code: 'unknown-row', rowId });
      continue;
    }

    if (rowItems.length > row.capacity) {
      issues.push({ code: 'row-over-capacity', rowId });
    }

    for (const itemId of rowItems) {
      placedItemIds.push(itemId);
      const solution = solutionByItem.get(itemId);
      if (!solution) {
        issues.push({ code: 'unknown-item', itemId, rowId });
        continue;
      }

      if (solution.capacity === row.capacity) {
        correctCount += 1;
      }
    }
  }

  const seenItemIds = new Set<string>();
  for (const itemId of placedItemIds) {
    if (seenItemIds.has(itemId)) {
      issues.push({ code: 'duplicate-item', itemId });
    }
    seenItemIds.add(itemId);
  }

  const expectedItemIds = new Set(puzzle.items.map((item) => item.itemId));
  const complete = issues.length === 0
    && placedItemIds.length === expectedItemIds.size
    && seenItemIds.size === expectedItemIds.size
    && [...seenItemIds].every((itemId) => expectedItemIds.has(itemId))
    && puzzle.rows.every((row) => (placements.get(row.rowId)?.length ?? 0) === row.capacity);

  if (!complete) {
    issues.push({ code: 'board-incomplete' });
  }

  return {
    complete,
    correctCount,
    solved: complete && correctCount === puzzle.items.length,
    issues,
  };
}

export function chooseHintCandidate(
  puzzle: AuthoringPuzzleRecord,
  placements: ReadonlyMap<string, readonly string[]>,
  lockedItemIds: ReadonlySet<string>,
  randomIndex: RandomIndex = defaultRandomIndex,
): HintCandidate | null {
  const rowByCapacity = new Map<RowCapacity, RowId>(
    puzzle.rows.map((row) => [row.capacity, row.rowId]),
  );
  const solutionByItem = createSolutionIndex(puzzle);
  const currentRowByItem = createCurrentRowIndex(placements);
  const candidates: HintCandidate[] = [];

  for (const item of puzzle.items) {
    if (lockedItemIds.has(item.itemId)) {
      continue;
    }

    const solution = solutionByItem.get(item.itemId);
    const correctRowId = solution ? rowByCapacity.get(solution.capacity) : undefined;
    if (!solution || !correctRowId || currentRowByItem.get(item.itemId) === correctRowId) {
      continue;
    }

    candidates.push({ itemId: item.itemId, rowId: correctRowId });
  }

  if (candidates.length === 0) {
    return null;
  }

  const selectedIndex = randomIndex(candidates.length);
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= candidates.length) {
    throw new RangeError('randomIndex must return an integer within the candidate range.');
  }

  return candidates[selectedIndex];
}

function createSolutionIndex(
  puzzle: AuthoringPuzzleRecord,
): ReadonlyMap<string, { readonly groupId: string; readonly capacity: RowCapacity }> {
  const index = new Map<string, { readonly groupId: string; readonly capacity: RowCapacity }>();
  for (const group of puzzle.solution.groups) {
    for (const itemId of group.itemIds) {
      index.set(itemId, { groupId: group.groupId, capacity: group.capacity });
    }
  }
  return index;
}

function createCurrentRowIndex(
  placements: ReadonlyMap<string, readonly string[]>,
): ReadonlyMap<string, string> {
  const index = new Map<string, string>();
  for (const [rowId, itemIds] of placements) {
    for (const itemId of itemIds) {
      index.set(itemId, rowId);
    }
  }
  return index;
}

function defaultRandomIndex(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}
