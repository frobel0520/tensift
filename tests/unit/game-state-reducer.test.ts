import { describe, expect, it } from 'vitest';
import countriesFixture from '../../content/puzzles/en/countries-continent-2026-09-01-en.json';
import type { SafePuzzleDto } from '../../src/api/contracts';
import {
  canCheck,
  createInitialGameState,
  gameReducer,
  stateFromPuzzle,
  toPlacementArray,
} from '../../src/domain/game/state';

const puzzle = countriesFixture as unknown as SafePuzzleDto;
const itemIds = puzzle.items.map((item) => item.itemId);

describe('game state reducer', () => {
  it('loads a puzzle and swaps an unhinted card into an occupied slot', () => {
    let state = gameReducer(createInitialGameState(), {
      type: 'puzzle/loaded',
      puzzle,
      session: null,
      shuffledItemIds: itemIds,
    });

    expect(state.phase).toBe('ready');
    state = gameReducer(state, { type: 'item/place', itemId: itemIds[0], rowId: 'row-1', slotIndex: 0 });
    state = gameReducer(state, { type: 'item/place', itemId: itemIds[1], rowId: 'row-2', slotIndex: 0 });
    state = gameReducer(state, { type: 'item/place', itemId: itemIds[1], rowId: 'row-1', slotIndex: 0 });

    expect(state.placements.get('row-1')).toEqual([itemIds[1]]);
    expect(state.placements.get('row-2')).toEqual([itemIds[0]]);
  });

  it('places and locks a hint without consuming an attempt', () => {
    const loaded = stateFromPuzzle(puzzle, null, itemIds);
    const state = gameReducer(loaded, {
      type: 'hint/accepted',
      itemId: 'country-australia',
      rowId: 'row-1',
    });

    expect(state.hintUsed).toBe(true);
    expect(state.attempts).toBe(0);
    expect(state.lockedItemIds.has('country-australia')).toBe(true);
    expect(state.placements.get('row-1')).toEqual(['country-australia']);
  });

  it('requires a full board, then records an accepted check', () => {
    let state = stateFromPuzzle(puzzle, null, itemIds);
    const solutionRows = [
      ['country-australia'],
      ['country-brazil', 'country-argentina'],
      ['country-canada', 'country-mexico', 'country-united-states'],
      ['country-france', 'country-germany', 'country-italy', 'country-spain'],
    ] as const;
    for (const [rowIndex, rowItems] of solutionRows.entries()) {
      for (const [slotIndex, itemId] of rowItems.entries()) {
        state = gameReducer(state, {
          type: 'item/place',
          itemId,
          rowId: `row-${rowIndex + 1}` as 'row-1' | 'row-2' | 'row-3' | 'row-4',
          slotIndex,
        });
      }
    }

    expect(canCheck(state, 10)).toBe(true);
    state = gameReducer(state, { type: 'check/requested' });
    state = gameReducer(state, { type: 'check/accepted', correctCount: 10, solved: true });

    expect(state.phase).toBe('solved');
    expect(state.attempts).toBe(1);
    expect(state.solved).toBe(true);
    expect(toPlacementArray(state.placements)).toHaveLength(10);
  });

  it('removes an unlocked item and keeps a locked item in place', () => {
    let state = stateFromPuzzle(puzzle, null, itemIds);
    state = gameReducer(state, { type: 'item/place', itemId: itemIds[0], rowId: 'row-1', slotIndex: 0 });
    state = gameReducer(state, { type: 'item/remove', itemId: itemIds[0] });
    expect(state.placements.get('row-1')).toEqual([]);

    state = gameReducer(state, { type: 'hint/accepted', itemId: itemIds[0], rowId: 'row-1' });
    state = gameReducer(state, { type: 'item/remove', itemId: itemIds[0] });
    expect(state.placements.get('row-1')).toEqual([itemIds[0]]);
  });

  it('resets movable cards without making a one-use hint reusable', () => {
    let state = stateFromPuzzle(puzzle, null, itemIds);
    state = gameReducer(state, { type: 'hint/accepted', itemId: itemIds[0], rowId: 'row-1' });
    state = gameReducer(state, { type: 'item/place', itemId: itemIds[1], rowId: 'row-2', slotIndex: 0 });
    state = gameReducer(state, { type: 'board/reset' });

    expect(state.hintUsed).toBe(true);
    expect(state.lockedItemIds.has(itemIds[0])).toBe(true);
    expect(state.placements.get('row-1')).toEqual([itemIds[0]]);
    expect(state.placements.get('row-2')).toEqual([]);
  });
});
