export function isCompletePlacement(placements, puzzle) {
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
