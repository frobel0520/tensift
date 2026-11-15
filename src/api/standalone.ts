import type {
  CheckRequest,
  CheckResponse,
  HintRequest,
  HintResponse,
  Locale,
  Placement,
  RevealResponse,
  RowId,
  SafePuzzleDto,
} from './contracts';
import type { AuthoringPuzzleRecord, DifficultyBand } from '../domain/puzzle/authoring';
import { chooseHintCandidate, evaluatePlacements } from '../domain/puzzle/engine';

export interface StandaloneLevelEntry {
  readonly level: number;
  readonly puzzle: AuthoringPuzzleRecord;
}

export interface LevelSummary {
  readonly level: number;
  readonly puzzleId: string;
  readonly puzzleFamilyId: string;
  readonly theme: string;
  readonly difficulty: {
    readonly band: DifficultyBand;
    readonly score: number;
  };
}

export interface StandalonePuzzleClient {
  loadCatalog(locale: Locale): Promise<readonly StandaloneLevelEntry[]>;
  getLevelSummaries(locale: Locale): Promise<readonly LevelSummary[]>;
  getLevel(locale: Locale, level: number): Promise<SafePuzzleDto>;
  check(puzzleId: string, request: CheckRequest): Promise<CheckResponse>;
  hint(puzzleId: string, request: HintRequest): Promise<HintResponse>;
  reveal(puzzleId: string, clientSessionId: string): Promise<RevealResponse>;
}

const catalogCache = new Map<Locale, Promise<readonly StandaloneLevelEntry[]>>();
const puzzleById = new Map<string, AuthoringPuzzleRecord>();

async function importLocaleCatalog(locale: Locale): Promise<readonly StandaloneLevelEntry[]> {
  let entries: readonly StandaloneLevelEntry[];
  if (locale === 'zh-Hant') {
    entries = (await import('../data/catalog-zh-Hant.json')).default as readonly StandaloneLevelEntry[];
  } else if (locale === 'es-419') {
    entries = (await import('../data/catalog-es-419.json')).default as readonly StandaloneLevelEntry[];
  } else {
    entries = (await import('../data/catalog-en.json')).default as readonly StandaloneLevelEntry[];
  }

  for (const entry of entries) {
    puzzleById.set(entry.puzzle.puzzleId, entry.puzzle);
  }
  return entries;
}

function toSafePuzzleDto(puzzle: AuthoringPuzzleRecord): SafePuzzleDto {
  return {
    puzzleId: puzzle.puzzleId,
    publishDate: puzzle.publishDate,
    locale: puzzle.locale,
    theme: puzzle.theme,
    items: puzzle.items,
    rows: puzzle.rows,
    policy: { maxHints: 1, checks: 'unlimited' },
  };
}

function toPlacementMap(placements: readonly Placement[] = []): ReadonlyMap<string, readonly string[]> {
  const grouped = new Map<string, string[]>();
  for (const placement of placements) {
    const existing = grouped.get(placement.rowId);
    if (existing) {
      existing.push(placement.itemId);
    } else {
      grouped.set(placement.rowId, [placement.itemId]);
    }
  }
  return grouped;
}

export function createStandaloneClient(): StandalonePuzzleClient {
  const loadCatalog = (locale: Locale): Promise<readonly StandaloneLevelEntry[]> => {
    const cached = catalogCache.get(locale);
    if (cached) {
      return cached;
    }
    const promise = importLocaleCatalog(locale);
    catalogCache.set(locale, promise);
    return promise;
  };

  return {
    loadCatalog,
    getLevelSummaries: async (locale) => {
      const entries = await loadCatalog(locale);
      return entries.map((entry) => ({
        level: entry.level,
        puzzleId: entry.puzzle.puzzleId,
        puzzleFamilyId: entry.puzzle.puzzleFamilyId,
        theme: entry.puzzle.theme,
        difficulty: entry.puzzle.difficulty,
      }));
    },
    getLevel: async (locale, level) => {
      const entries = await loadCatalog(locale);
      const clamped = Math.max(1, Math.min(entries.length, Math.trunc(level)));
      const found = entries.find((entry) => entry.level === clamped) ?? entries[0];
      if (!found) {
        throw new Error(`No puzzle found for level ${level} (${locale})`);
      }
      return toSafePuzzleDto(found.puzzle);
    },
    check: async (puzzleId, request) => {
      const puzzle = puzzleById.get(puzzleId);
      if (!puzzle) {
        throw new Error(`Puzzle ${puzzleId} is not loaded.`);
      }
      const evaluation = evaluatePlacements(puzzle, toPlacementMap(request.placements));
      return {
        correctCount: evaluation.correctCount,
        solved: evaluation.solved,
        attemptAccepted: true,
      };
    },
    hint: async (puzzleId, request) => {
      const puzzle = puzzleById.get(puzzleId);
      if (!puzzle) {
        throw new Error(`Puzzle ${puzzleId} is not loaded.`);
      }
      const candidate = chooseHintCandidate(
        puzzle,
        toPlacementMap(request.placements),
        new Set(request.lockedItemIds ?? []),
      );
      if (!candidate) {
        throw new Error('No unused hint candidate is available.');
      }
      return {
        itemId: candidate.itemId,
        rowId: candidate.rowId as RowId,
        hintAccepted: true,
      };
    },
    reveal: async (puzzleId) => {
      const puzzle = puzzleById.get(puzzleId);
      if (!puzzle) {
        throw new Error(`Puzzle ${puzzleId} is not loaded.`);
      }
      return {
        hiddenDimension: puzzle.solution.hiddenDimension,
        groups: puzzle.solution.groups,
        explanation: puzzle.explanation,
        sources: puzzle.sources,
      };
    },
  };
}
