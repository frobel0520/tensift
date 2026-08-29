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

export function isCompletePlacement(
  placements: ReadonlyMap<RowId, readonly string[]>,
  puzzle: PuzzleReference,
): boolean {
  const knownRows = new Map(puzzle.rows.map((row) => [row.rowId, row]));
  if (placements.size !== knownRows.size || [...placements.keys()].some((rowId) => !knownRows.has(rowId))) {
    return false;
  }

  for (const [rowId, rowItems] of placements) {
    if (rowItems.length !== knownRows.get(rowId)?.capacity) {
      return false;
    }
  }

  const placedItemIds = [...placements.values()].flat();
  const expectedItemIds = new Set(puzzle.itemIds);
  const uniquePlacedItemIds = new Set(placedItemIds);

  if (placedItemIds.length !== puzzle.itemIds.length) {
    return false;
  }

  if (uniquePlacedItemIds.size !== placedItemIds.length) {
    return false;
  }

  if (uniquePlacedItemIds.size !== expectedItemIds.size) {
    return false;
  }

  return [...uniquePlacedItemIds].every((itemId) => expectedItemIds.has(itemId));
}
