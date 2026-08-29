import type {
  ApiErrorBody,
  Locale,
  RevealResponse,
  RowId,
  SafePuzzleDto,
} from '../../api/contracts';
import type { PersistedGameSession } from './session';

export type GamePhase = 'loading' | 'ready' | 'checking' | 'solved' | 'revealed' | 'error';

export interface CheckFeedback {
  readonly kind: 'check';
  readonly correctCount: number;
  readonly solved: boolean;
}

export interface HintFeedback {
  readonly kind: 'hint';
  readonly itemId: string;
  readonly rowId: RowId;
}

export type GameFeedback = CheckFeedback | HintFeedback;

export interface GameState {
  readonly phase: GamePhase;
  readonly puzzle: SafePuzzleDto | null;
  readonly puzzleId: string | null;
  readonly locale: Locale | null;
  readonly placements: ReadonlyMap<RowId, readonly string[]>;
  readonly lockedItemIds: ReadonlySet<string>;
  readonly shuffledItemIds: readonly string[];
  readonly selectedItemId: string | null;
  readonly attempts: number;
  readonly hintUsed: boolean;
  readonly correctCount: number | null;
  readonly solved: boolean;
  readonly feedback: GameFeedback | null;
  readonly error: ApiErrorBody | null;
  readonly reveal: RevealResponse | null;
}

export type GameAction =
  | { readonly type: 'puzzle/loading' }
  | {
    readonly type: 'puzzle/loaded';
    readonly puzzle: SafePuzzleDto;
    readonly session: PersistedGameSession | null;
    readonly shuffledItemIds: readonly string[];
  }
  | { readonly type: 'item/select'; readonly itemId: string | null }
  | {
    readonly type: 'item/place';
    readonly itemId: string;
    readonly rowId: RowId;
    readonly slotIndex: number;
  }
  | { readonly type: 'item/remove'; readonly itemId: string }
  | { readonly type: 'items/shuffle'; readonly itemIds: readonly string[] }
  | { readonly type: 'board/reset' }
  | { readonly type: 'check/requested' }
  | {
    readonly type: 'check/accepted';
    readonly correctCount: number;
    readonly solved: boolean;
  }
  | { readonly type: 'hint/accepted'; readonly itemId: string; readonly rowId: RowId }
  | { readonly type: 'reveal/accepted'; readonly reveal: RevealResponse }
  | {
    readonly type: 'error';
    readonly error: ApiErrorBody;
    readonly resumePhase?: 'ready' | 'solved' | 'revealed';
  }
  | { readonly type: 'error/dismissed' }
  | { readonly type: 'result/closed' };

export function createInitialGameState(): GameState {
  return {
    phase: 'loading',
    puzzle: null,
    puzzleId: null,
    locale: null,
    placements: new Map<RowId, readonly string[]>(),
    lockedItemIds: new Set<string>(),
    shuffledItemIds: [],
    selectedItemId: null,
    attempts: 0,
    hintUsed: false,
    correctCount: null,
    solved: false,
    feedback: null,
    error: null,
    reveal: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'puzzle/loading':
      return { ...createInitialGameState(), phase: 'loading' };

    case 'puzzle/loaded':
      return stateFromPuzzle(action.puzzle, action.session, action.shuffledItemIds);

    case 'item/select':
      if (!state.puzzle || state.phase === 'checking' || state.phase === 'solved' || state.phase === 'revealed') {
        return state;
      }
      return {
        ...state,
        selectedItemId: action.itemId,
        feedback: null,
        error: null,
      };

    case 'item/place': {
      if (!state.puzzle || state.phase !== 'ready') {
        return state;
      }
      const placements = placeItem(state.puzzle, state.placements, state.lockedItemIds, action);
      if (placements === state.placements) {
        return state;
      }
      return {
        ...state,
        placements,
        selectedItemId: null,
        feedback: null,
        error: null,
      };
    }

    case 'item/remove': {
      if (!state.puzzle || state.phase !== 'ready' || state.lockedItemIds.has(action.itemId)) {
        return state;
      }
      const placements = removeItem(state.placements, action.itemId);
      if (placements === state.placements) {
        return state;
      }
      return {
        ...state,
        placements,
        selectedItemId: null,
        feedback: null,
        error: null,
      };
    }

    case 'items/shuffle':
      return state.puzzle && action.itemIds.length === state.puzzle.items.length
        ? { ...state, shuffledItemIds: [...action.itemIds] }
        : state;

    case 'board/reset':
      if (!state.puzzle || state.phase === 'checking' || state.solved) {
        return state;
      }
      return {
        ...state,
        phase: 'ready',
        placements: keepLockedPlacements(state.puzzle, state.placements, state.lockedItemIds),
        lockedItemIds: new Set(state.lockedItemIds),
        selectedItemId: null,
        correctCount: null,
        feedback: null,
        error: null,
        reveal: null,
      };

    case 'check/requested':
      if (!state.puzzle || !canCheck(state, state.puzzle.items.length)) {
        return state;
      }
      return { ...state, phase: 'checking', selectedItemId: null, feedback: null, error: null };

    case 'check/accepted':
      if (!state.puzzle || state.phase !== 'checking') {
        return state;
      }
      return {
        ...state,
        phase: action.solved ? 'solved' : 'ready',
        attempts: state.attempts + 1,
        correctCount: action.correctCount,
        solved: action.solved,
        feedback: {
          kind: 'check',
          correctCount: action.correctCount,
          solved: action.solved,
        },
        error: null,
      };

    case 'hint/accepted': {
      if (!state.puzzle
        || state.phase !== 'ready'
        || state.hintUsed
        || !state.puzzle.items.some((item) => item.itemId === action.itemId)
        || !state.puzzle.rows.some((row) => row.rowId === action.rowId)) {
        return state;
      }
      const placements = placeHintedItem(
        state.puzzle,
        state.placements,
        state.lockedItemIds,
        action.itemId,
        action.rowId,
      );
      return {
        ...state,
        placements,
        lockedItemIds: new Set([...state.lockedItemIds, action.itemId]),
        hintUsed: true,
        selectedItemId: null,
        feedback: { kind: 'hint', itemId: action.itemId, rowId: action.rowId },
        error: null,
      };
    }

    case 'reveal/accepted':
      if (!state.puzzle || (state.phase !== 'ready' && state.phase !== 'solved')) {
        return state;
      }
      return { ...state, phase: 'revealed', reveal: action.reveal, error: null };

    case 'error':
      return {
        ...state,
        phase: action.resumePhase ?? (state.puzzle ? (state.solved ? 'solved' : 'ready') : 'error'),
        error: action.error,
      };

    case 'error/dismissed':
      return {
        ...state,
        phase: state.puzzle ? (state.solved ? 'solved' : 'ready') : 'error',
        error: null,
      };

    case 'result/closed':
      return {
        ...state,
        phase: state.solved ? 'solved' : 'ready',
        reveal: null,
      };
  }
}

export function stateFromPuzzle(
  puzzle: SafePuzzleDto,
  session: PersistedGameSession | null,
  shuffledItemIds: readonly string[],
): GameState {
  const placements = emptyPlacements(puzzle);
  if (session) {
    for (const row of puzzle.rows) {
      const itemIds = session.placements[row.rowId];
      if (itemIds) {
        placements.set(row.rowId, [...itemIds]);
      }
    }
  }

  const solved = session?.solved ?? false;
  return {
    phase: solved ? 'solved' : 'ready',
    puzzle,
    puzzleId: puzzle.puzzleId,
    locale: puzzle.locale,
    placements,
    lockedItemIds: new Set(session?.lockedItemIds ?? []),
    shuffledItemIds: [...shuffledItemIds],
    selectedItemId: null,
    attempts: session?.attempts ?? 0,
    hintUsed: session?.hintUsed ?? false,
    correctCount: null,
    solved,
    feedback: null,
    error: null,
    reveal: null,
  };
}

export function placementCount(placements: ReadonlyMap<RowId, readonly string[]>): number {
  return [...placements.values()].reduce((total, rowItems) => total + rowItems.length, 0);
}

export function isBoardFull(state: GameState): boolean {
  return state.puzzle !== null && placementCount(state.placements) === state.puzzle.items.length;
}

export function canCheck(state: GameState, itemCount: number): boolean {
  return state.phase === 'ready' && itemCount > 0 && placementCount(state.placements) === itemCount;
}

export function toPlacementArray(placements: ReadonlyMap<RowId, readonly string[]>): readonly { itemId: string; rowId: RowId }[] {
  const result: { itemId: string; rowId: RowId }[] = [];
  for (const [rowId, itemIds] of placements) {
    for (const itemId of itemIds) {
      result.push({ itemId, rowId });
    }
  }
  return result;
}

function emptyPlacements(puzzle: SafePuzzleDto): Map<RowId, readonly string[]> {
  return new Map(puzzle.rows.map((row) => [row.rowId, [] as readonly string[]]));
}

function keepLockedPlacements(
  puzzle: SafePuzzleDto,
  placements: ReadonlyMap<RowId, readonly string[]>,
  lockedItemIds: ReadonlySet<string>,
): Map<RowId, readonly string[]> {
  const next = emptyPlacements(puzzle);
  for (const row of puzzle.rows) {
    next.set(row.rowId, (placements.get(row.rowId) ?? []).filter((itemId) => lockedItemIds.has(itemId)));
  }
  return next;
}

function placeItem(
  puzzle: SafePuzzleDto,
  placements: ReadonlyMap<RowId, readonly string[]>,
  lockedItemIds: ReadonlySet<string>,
  action: Extract<GameAction, { readonly type: 'item/place' }>,
): ReadonlyMap<RowId, readonly string[]> {
  const itemIds = new Set(puzzle.items.map((item) => item.itemId));
  const row = puzzle.rows.find((candidate) => candidate.rowId === action.rowId);
  if (!row || !itemIds.has(action.itemId) || lockedItemIds.has(action.itemId) || action.slotIndex < 0 || action.slotIndex >= row.capacity) {
    return placements;
  }

  const slots = createSlots(puzzle, placements);
  const targetIndex = slotOffset(puzzle, action.rowId) + action.slotIndex;
  const sourceIndex = slots.indexOf(action.itemId);
  const targetItemId = slots[targetIndex];
  if (sourceIndex === targetIndex || (targetItemId !== undefined && lockedItemIds.has(targetItemId))) {
    return placements;
  }
  if (sourceIndex < 0 && targetItemId !== undefined) {
    return placements;
  }

  slots[targetIndex] = action.itemId;
  if (sourceIndex >= 0) {
    slots[sourceIndex] = targetItemId;
  }
  return slotsToPlacements(puzzle, slots);
}

function placeHintedItem(
  puzzle: SafePuzzleDto,
  placements: ReadonlyMap<RowId, readonly string[]>,
  lockedItemIds: ReadonlySet<string>,
  itemId: string,
  rowId: RowId,
): ReadonlyMap<RowId, readonly string[]> {
  const row = puzzle.rows.find((candidate) => candidate.rowId === rowId);
  if (!row || lockedItemIds.has(itemId)) {
    return placements;
  }

  const slots = createSlots(puzzle, placements);
  const rowOffset = slotOffset(puzzle, rowId);
  const sourceIndex = slots.indexOf(itemId);
  let targetIndex = -1;
  for (let index = 0; index < row.capacity; index += 1) {
    const candidate = slots[rowOffset + index];
    if (candidate === undefined || !lockedItemIds.has(candidate)) {
      targetIndex = rowOffset + index;
      if (candidate === undefined) {
        break;
      }
    }
  }
  if (targetIndex < 0 || targetIndex === sourceIndex) {
    return placements;
  }

  const targetItemId = slots[targetIndex];
  slots[targetIndex] = itemId;
  if (sourceIndex >= 0) {
    slots[sourceIndex] = targetItemId;
  }
  return slotsToPlacements(puzzle, slots);
}

function removeItem(
  placements: ReadonlyMap<RowId, readonly string[]>,
  itemId: string,
): ReadonlyMap<RowId, readonly string[]> {
  for (const [rowId, itemIds] of placements) {
    const index = itemIds.indexOf(itemId);
    if (index >= 0) {
      const next = new Map(placements);
      next.set(rowId, [...itemIds.slice(0, index), ...itemIds.slice(index + 1)]);
      return next;
    }
  }
  return placements;
}

function createSlots(puzzle: SafePuzzleDto, placements: ReadonlyMap<RowId, readonly string[]>): Array<string | undefined> {
  const slots: Array<string | undefined> = [];
  for (const row of puzzle.rows) {
    const rowItems = placements.get(row.rowId) ?? [];
    for (let index = 0; index < row.capacity; index += 1) {
      slots.push(rowItems[index]);
    }
  }
  return slots;
}

function slotsToPlacements(puzzle: SafePuzzleDto, slots: readonly (string | undefined)[]): Map<RowId, readonly string[]> {
  const placements = new Map<RowId, readonly string[]>();
  let offset = 0;
  for (const row of puzzle.rows) {
    const rowItems: string[] = [];
    for (let index = 0; index < row.capacity; index += 1) {
      const itemId = slots[offset + index];
      if (itemId !== undefined) {
        rowItems.push(itemId);
      }
    }
    placements.set(row.rowId, rowItems);
    offset += row.capacity;
  }
  return placements;
}

function slotOffset(puzzle: SafePuzzleDto, rowId: RowId): number {
  let offset = 0;
  for (const row of puzzle.rows) {
    if (row.rowId === rowId) {
      return offset;
    }
    offset += row.capacity;
  }
  return -1;
}
