import { describe, expect, it } from 'vitest';
import { canCheck, createInitialGameState } from '../../src/domain/game/state';

describe('game state skeleton', () => {
  it('starts with a loading state and no attempts', () => {
    const state = createInitialGameState();

    expect(state.phase).toBe('loading');
    expect(state.attempts).toBe(0);
    expect(state.hintUsed).toBe(false);
  });

  it('does not allow checking before the board is ready and full', () => {
    const state = createInitialGameState();

    expect(canCheck(state, 10)).toBe(false);
  });
});
