import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, DragEvent } from 'react';
import {
  ApiRequestError,
} from './api/client';
import {
  createStandaloneClient,
  type LevelSummary,
  type StandalonePuzzleClient,
} from './api/standalone';
import {
  SUPPORTED_LOCALES,
  normalizeLocale,
  type ApiErrorBody,
  type Locale,
  type RevealResponse,
  type RowId,
  type SafePuzzleItem,
} from './api/contracts';
import {
  canCheck,
  createInitialGameState,
  gameReducer,
  toPlacementArray,
} from './domain/game/state';
import { loadSession, saveSession } from './domain/game/session';
import { getMessages, type UiMessages } from './i18n/messages';
import { SiteNavigation } from './ui/site-navigation';
import {
  isThemeMode,
  persistTheme,
  readStoredTheme,
  type ThemeMode,
} from './ui/preferences';
import { buildSharePayload, shareResult, type ShareResultOutcome } from './ui/share';

const LOCALE_STORAGE_KEY = 'tensift:locale';
const CURRENT_LEVEL_STORAGE_KEY = 'tensift:v1:current-level';
const SOLVED_LEVELS_STORAGE_KEY = 'tensift:v1:solved-levels';
const TOTAL_LEVELS = 300;
type BusyAction = 'loading' | 'checking' | 'hint' | 'reveal' | null;
type ShareUiState = ShareResultOutcome | 'sharing' | 'error' | null;

export function App() {
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());
  const [theme, setTheme] = useState<ThemeMode>(() => readStoredTheme(getLocalStorage()));
  const [currentLevel, setCurrentLevel] = useState<number>(() => getInitialLevel());
  const [levelSummaries, setLevelSummaries] = useState<readonly LevelSummary[]>([]);
  const [solvedFamilyIds, setSolvedFamilyIds] = useState<ReadonlySet<string>>(() => getInitialSolvedFamilies());
  const [levelPickerOpen, setLevelPickerOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [busyAction, setBusyAction] = useState<BusyAction>('loading');
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const apiClient = useMemo<StandalonePuzzleClient>(() => createStandaloneClient(), []);
  const clientSessionId = useRef(createClientSessionId()).current;
  const hintIdempotencyKey = useRef<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const copy = getMessages(locale);

  useEffect(() => {
    persistLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    persistTheme(getLocalStorage(), theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    try {
      getLocalStorage()?.setItem(CURRENT_LEVEL_STORAGE_KEY, String(currentLevel));
    } catch {
      // Ignore storage write failures.
    }
  }, [currentLevel]);

  useEffect(() => {
    let cancelled = false;
    setBusyAction('loading');
    dispatch({ type: 'puzzle/loading' });

    void Promise.all([
      apiClient.getLevel(locale, currentLevel),
      apiClient.getLevelSummaries(locale),
    ])
      .then(([puzzle, summaries]) => {
        if (cancelled) {
          return;
        }
        setLevelSummaries(summaries);
        const storage = getLocalStorage();
        const session = storage ? loadSession(storage, puzzle) : null;
        const currentSummary = summaries.find((s) => s.puzzleId === puzzle.puzzleId);
        if (session?.solved && currentSummary) {
          markFamilySolved(currentSummary.puzzleFamilyId, setSolvedFamilyIds);
        }
        dispatch({
          type: 'puzzle/loaded',
          puzzle,
          session,
          shuffledItemIds: shuffleIds(puzzle.items.map((item) => item.itemId)),
        });
        setBusyAction(null);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        dispatch({ type: 'error', error: toApiError(error) });
        setBusyAction(null);
      });

    return () => {
      cancelled = true;
    };
  }, [apiClient, currentLevel, locale, reloadToken]);

  useEffect(() => {
    if (!state.puzzle || (state.phase !== 'ready' && state.phase !== 'solved')) {
      return;
    }
    const storage = getLocalStorage();
    if (!storage) {
      return;
    }
    saveSession(storage, {
      puzzle: state.puzzle,
      placements: state.placements,
      lockedItemIds: state.lockedItemIds,
      attempts: state.attempts,
      hintUsed: state.hintUsed,
      solved: state.solved,
    });
  }, [
    state.attempts,
    state.hintUsed,
    state.lockedItemIds,
    state.phase,
    state.placements,
    state.puzzle,
    state.solved,
  ]);

  useEffect(() => {
    if (state.reveal) {
      closeButtonRef.current?.focus();
    }
  }, [state.reveal]);

  useEffect(() => {
    if (!state.reveal) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch({ type: 'result/closed' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.reveal]);

  const handleCheck = useCallback(async () => {
    if (!state.puzzle || busyAction !== null || !canCheck(state, state.puzzle.items.length)) {
      return;
    }

    const puzzleId = state.puzzle.puzzleId;
    const placements = toPlacementArray(state.placements);
    dispatch({ type: 'check/requested' });
    setBusyAction('checking');
    let solved = false;
    try {
      const response = await apiClient.check(puzzleId, {
        clientSessionId,
        placements,
      });
      solved = response.solved;
      dispatch({
        type: 'check/accepted',
        correctCount: response.correctCount,
        solved: response.solved,
      });

      if (response.solved) {
        const currentSummary = levelSummaries.find((s) => s.puzzleId === puzzleId);
        if (currentSummary) {
          markFamilySolved(currentSummary.puzzleFamilyId, setSolvedFamilyIds);
        }
        setBusyAction('reveal');
        const reveal = await apiClient.reveal(puzzleId, clientSessionId);
        dispatch({ type: 'reveal/accepted', reveal });
      }
    } catch (error) {
      dispatch({
        type: 'error',
        error: toApiError(error),
        resumePhase: solved ? 'solved' : 'ready',
      });
    } finally {
      setBusyAction(null);
    }
  }, [apiClient, busyAction, clientSessionId, levelSummaries, state]);

  const handleHint = useCallback(async () => {
    if (!state.puzzle || busyAction !== null || state.phase !== 'ready' || state.hintUsed) {
      return;
    }

    const puzzleId = state.puzzle.puzzleId;
    const idempotencyKey = hintIdempotencyKey.current ?? createClientSessionId();
    hintIdempotencyKey.current = idempotencyKey;
    setBusyAction('hint');
    try {
      const response = await apiClient.hint(puzzleId, {
        clientSessionId,
        idempotencyKey,
        placements: toPlacementArray(state.placements),
        lockedItemIds: [...state.lockedItemIds],
      });
      dispatch({ type: 'hint/accepted', itemId: response.itemId, rowId: response.rowId });
      hintIdempotencyKey.current = null;
    } catch (error) {
      dispatch({ type: 'error', error: toApiError(error), resumePhase: 'ready' });
    } finally {
      setBusyAction(null);
    }
  }, [apiClient, busyAction, clientSessionId, state]);

  const handleReveal = useCallback(async () => {
    if (!state.puzzle || busyAction !== null || (state.phase !== 'ready' && state.phase !== 'solved')) {
      return;
    }

    setBusyAction('reveal');
    try {
      const reveal = await apiClient.reveal(state.puzzle.puzzleId, clientSessionId);
      dispatch({ type: 'reveal/accepted', reveal });
    } catch (error) {
      dispatch({
        type: 'error',
        error: toApiError(error),
        resumePhase: state.solved ? 'solved' : 'ready',
      });
    } finally {
      setBusyAction(null);
    }
  }, [apiClient, busyAction, clientSessionId, state]);

  const handleRetry = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const showLoading = busyAction === 'loading' || state.phase === 'loading' || state.locale !== locale;
  const errorMessage = state.error ? localizeError(state.error, copy) : null;

  return (
    <main className="app-shell">
      <header className="masthead">
        <div className="brand-lockup">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>Tensift</h1>
          <p className="tagline">{copy.tagline}</p>
        </div>
        <div className="header-controls">
          <label className="language-control">
            <span>{copy.language}</span>
            <select
              value={locale}
              onChange={(event) => {
                const nextLocale = event.target.value;
                if (isLocale(nextLocale)) {
                  setLocale(nextLocale);
                }
              }}
            >
              <option value="en">English</option>
              <option value="zh-Hant">繁體中文</option>
              <option value="es-419">Español</option>
            </select>
          </label>
          <label className="theme-control">
            <span>{copy.theme}</span>
            <select
              value={theme}
              aria-label={copy.theme}
              onChange={(event) => {
                const nextTheme = event.target.value;
                if (isThemeMode(nextTheme)) {
                  setTheme(nextTheme);
                }
              }}
            >
              <option value="paper">{copy.themeOriginal}</option>
              <option value="light">{copy.themeLight}</option>
              <option value="dark">{copy.themeDark}</option>
            </select>
          </label>
        </div>
      </header>
      <SiteNavigation locale={locale} />

      {showLoading && (
        <section className="loading-panel" aria-live="polite" aria-busy="true">
          <span className="loading-mark" aria-hidden="true">✦</span>
          <div>
            <h2>{copy.loadingTitle}</h2>
            <p>{copy.loadingBody}</p>
          </div>
        </section>
      )}

      {!showLoading && !state.puzzle && (
        <ErrorPanel
          copy={copy}
          title={state.error?.code === 'PUZZLE_NOT_FOUND' ? copy.unavailableTitle : copy.errorTitle}
          message={state.error?.code === 'PUZZLE_NOT_FOUND' ? copy.unavailableBody : errorMessage ?? copy.genericError}
          onRetry={handleRetry}
        />
      )}

      {!showLoading && state.puzzle && (
        <PuzzleView
          copy={copy}
          state={state}
          busyAction={busyAction}
          errorMessage={errorMessage}
          currentLevel={currentLevel}
          totalLevels={levelSummaries.length || TOTAL_LEVELS}
          solvedCount={solvedFamilyIds.size}
          onSelectLevel={(level) => {
            setCurrentLevel(level);
            setLevelPickerOpen(false);
          }}
          onOpenLevelPicker={() => setLevelPickerOpen(true)}
          onCheck={handleCheck}
          onHint={handleHint}
          onReveal={handleReveal}
          onDispatch={dispatch}
        />
      )}

      {state.reveal && state.puzzle && (
        <RevealModal
          copy={copy}
          reveal={state.reveal}
          puzzleItems={state.puzzle.items}
          puzzleTheme={state.puzzle.theme}
          puzzleDate={state.puzzle.publishDate}
          attempts={state.attempts}
          hintUsed={state.hintUsed}
          solved={state.solved}
          currentLevel={currentLevel}
          totalLevels={levelSummaries.length || TOTAL_LEVELS}
          onNextLevel={() => {
            dispatch({ type: 'result/closed' });
            setCurrentLevel((lvl) => Math.min(levelSummaries.length || TOTAL_LEVELS, lvl + 1));
          }}
          closeButtonRef={closeButtonRef}
          onClose={() => dispatch({ type: 'result/closed' })}
        />
      )}

      {levelPickerOpen && (
        <LevelPickerModal
          copy={copy}
          summaries={levelSummaries}
          currentLevel={currentLevel}
          solvedFamilyIds={solvedFamilyIds}
          onSelectLevel={(level) => {
            setCurrentLevel(level);
            setLevelPickerOpen(false);
          }}
          onClose={() => setLevelPickerOpen(false)}
        />
      )}
    </main>
  );
}

interface PuzzleViewProps {
  readonly copy: UiMessages;
  readonly state: ReturnType<typeof createInitialGameState>;
  readonly busyAction: BusyAction;
  readonly errorMessage: string | null;
  readonly currentLevel: number;
  readonly totalLevels: number;
  readonly solvedCount: number;
  readonly onSelectLevel: (level: number) => void;
  readonly onOpenLevelPicker: () => void;
  readonly onCheck: () => void;
  readonly onHint: () => void;
  readonly onReveal: () => void;
  readonly onDispatch: React.Dispatch<Parameters<typeof gameReducer>[1]>;
}

function PuzzleView({
  copy,
  state,
  busyAction,
  errorMessage,
  currentLevel,
  totalLevels,
  solvedCount,
  onSelectLevel,
  onOpenLevelPicker,
  onCheck,
  onHint,
  onReveal,
  onDispatch,
}: PuzzleViewProps) {
  const puzzle = state.puzzle;
  if (!puzzle) {
    return null;
  }

  const itemById = new Map(puzzle.items.map((item) => [item.itemId, item]));
  const placedItemIds = new Set([...state.placements.values()].flat());
  const trayItemIds = state.shuffledItemIds.filter((itemId) => !placedItemIds.has(itemId));
  const checkEnabled = canCheck(state, puzzle.items.length) && busyAction === null;
  const locked = state.lockedItemIds;

  return (
    <div className="game-layout">
      <section className="game-column" aria-labelledby="puzzle-title">
        <div className="level-nav" aria-label={copy.levelPickerTitle}>
          <button
            className="button level-nav-btn"
            type="button"
            disabled={currentLevel <= 1}
            onClick={() => onSelectLevel(Math.max(1, currentLevel - 1))}
          >
            ← {copy.prevLevel}
          </button>
          <button
            className="button level-nav-picker"
            type="button"
            onClick={onOpenLevelPicker}
          >
            {interpolate(copy.levelsButton, { solved: solvedCount, total: totalLevels })}
          </button>
          <button
            className="button level-nav-btn"
            type="button"
            disabled={currentLevel >= totalLevels}
            onClick={() => onSelectLevel(Math.min(totalLevels, currentLevel + 1))}
          >
            {copy.nextLevel} →
          </button>
        </div>

        <div className="puzzle-meta">
          <div>
            <p className="topic-label">{interpolate(copy.topicLabel, { level: currentLevel, total: totalLevels })}</p>
            <h2 className="topic-name" id="puzzle-title">{puzzle.theme}</h2>
          </div>
          <div className="checks" aria-label={`${copy.attempts}: ${state.attempts}`}>
            <span>{copy.attempts}</span>
            <span className="attempts-value">{state.attempts}</span>
          </div>
        </div>

        <p className="instruction">{copy.instruction}</p>
        <div className="sorting-board" aria-label={copy.instruction}>
          {puzzle.rows.map((row) => {
            const rowItems = state.placements.get(row.rowId) ?? [];
            const rowLabel = interpolate(copy.rowLabel, { count: row.capacity });
            return (
              <div
                className="group-row"
                key={row.rowId}
                style={{ '--slot-count': row.capacity, '--row-width': `${row.capacity * 25}%` } as CSSProperties}
              >
                <div className="capacity" aria-hidden="true">{row.capacity}</div>
                <div className="slots" role="list" aria-label={rowLabel}>
                  {Array.from({ length: row.capacity }, (_, slotIndex) => {
                    const itemId = rowItems[slotIndex];
                    const item = itemId ? itemById.get(itemId) : undefined;
                    const isLocked = itemId ? locked.has(itemId) : false;
                    if (!item) {
                      return (
                        <button
                          className="slot slot--empty"
                          type="button"
                          key={`${row.rowId}-${slotIndex}`}
                          aria-label={copy.dropCard}
                          onClick={() => {
                            if (state.selectedItemId) {
                              onDispatch({
                                type: 'item/place',
                                itemId: state.selectedItemId,
                                rowId: row.rowId,
                                slotIndex,
                              });
                            }
                          }}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => handleDrop(event, row.rowId, slotIndex, onDispatch)}
                        >
                          <span>{copy.emptySlot}</span>
                        </button>
                      );
                    }

                    return (
                      <div className={`slot slot--filled${isLocked ? ' is-locked' : ''}`} role="listitem" key={itemId}>
                        <button
                          className={`item-card item-card--placed${state.selectedItemId === itemId ? ' is-selected' : ''}`}
                          type="button"
                          aria-label={interpolate(copy.selectCard, { item: item.label })}
                          aria-pressed={state.selectedItemId === itemId}
                          draggable={!isLocked}
                          onClick={() => {
                            if (!isLocked) {
                              onDispatch({
                                type: 'item/select',
                                itemId: state.selectedItemId === itemId ? null : itemId,
                              });
                            }
                          }}
                          onDragStart={(event) => handleDragStart(event, itemId, onDispatch)}
                        >
                          <ItemVisual item={item} />
                          <span className="item-name">{item.label}</span>
                        </button>
                        {isLocked ? (
                          <span className="lock-label">{copy.locked}</span>
                        ) : (
                          <button
                            type="button"
                            className="slot-remove"
                            aria-label={interpolate(copy.remove, { item: item.label })}
                            onClick={() => onDispatch({ type: 'item/remove', itemId })}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="tray-label">
          <span>{copy.unsortedCards}</span>
          <span>{interpolate(copy.remaining, { count: trayItemIds.length })}</span>
        </div>
        <div className="item-tray" role="list" aria-label={copy.unsortedCards}>
          {trayItemIds.length === 0 ? (
            <p className="empty-tray">{copy.emptyTray}</p>
          ) : trayItemIds.map((itemId) => {
            const item = itemById.get(itemId);
            return item ? (
              <button
                className={`item-card item-card--tray${state.selectedItemId === itemId ? ' is-selected' : ''}`}
                type="button"
                role="listitem"
                key={itemId}
                aria-label={interpolate(copy.selectCard, { item: item.label })}
                aria-pressed={state.selectedItemId === itemId}
                draggable
                onClick={() => onDispatch({
                  type: 'item/select',
                  itemId: state.selectedItemId === itemId ? null : itemId,
                })}
                onDragStart={(event) => handleDragStart(event, itemId, onDispatch)}
              >
                <ItemVisual item={item} />
                <span className="item-name">{item.label}</span>
              </button>
            ) : null;
          })}
        </div>

        {(state.feedback || errorMessage) && (
          <div className={`feedback-bar${errorMessage ? ' feedback-bar--error' : ''}`} role={errorMessage ? 'alert' : 'status'} aria-live="polite">
            <p className="feedback-message">
              {errorMessage ?? feedbackMessage(state, copy, itemById)}
            </p>
            {errorMessage && (
              <button className="text-button" type="button" onClick={() => onDispatch({ type: 'error/dismissed' })}>{copy.dismiss}</button>
            )}
          </div>
        )}

        <div className="actions">
          <button className="button" type="button" onClick={() => onDispatch({ type: 'board/reset' })} disabled={busyAction !== null || state.solved}>
            {copy.reset}
          </button>
          <button className="button" type="button" onClick={() => onDispatch({ type: 'items/shuffle', itemIds: shuffleIds(state.shuffledItemIds) })} disabled={busyAction !== null || state.solved}>
            {copy.shuffle}
          </button>
          <button className="button" type="button" onClick={onHint} disabled={busyAction !== null || state.hintUsed || state.solved}>
            {busyAction === 'hint' ? copy.hintLoading : state.hintUsed ? copy.hintUsed : copy.useHint}
          </button>
          <button className="button button-primary" type="button" onClick={onCheck} disabled={!checkEnabled || state.solved}>
            {busyAction === 'checking' ? copy.checking : copy.check}
          </button>
        </div>
      </section>

      <aside className="notes-column" aria-label={copy.findLens}>
        <h2>{copy.findLens}</h2>
        <p>{copy.rulesBody}</p>
        <ul>
          <li>{copy.ruleTap}</li>
          <li>{copy.ruleUnlimited}</li>
          <li>{copy.ruleHint}</li>
        </ul>
      </aside>

      <button className="reveal-trigger" type="button" onClick={onReveal} disabled={busyAction !== null || state.phase === 'revealed'}>
        {busyAction === 'reveal' ? copy.revealLoading : copy.reveal}
      </button>
    </div>
  );
}

interface RevealModalProps {
  readonly copy: UiMessages;
  readonly reveal: RevealResponse;
  readonly puzzleItems: readonly SafePuzzleItem[];
  readonly puzzleTheme: string;
  readonly puzzleDate: string;
  readonly attempts: number;
  readonly hintUsed: boolean;
  readonly solved: boolean;
  readonly currentLevel: number;
  readonly totalLevels: number;
  readonly onNextLevel: () => void;
  readonly closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  readonly onClose: () => void;
}

function RevealModal({
  copy,
  reveal,
  puzzleItems,
  puzzleTheme,
  puzzleDate,
  attempts,
  hintUsed,
  solved,
  currentLevel,
  totalLevels,
  onNextLevel,
  closeButtonRef,
  onClose,
}: RevealModalProps) {
  const [shareState, setShareState] = useState<ShareUiState>(null);
  const itemById = new Map(puzzleItems.map((item) => [item.itemId, item.label]));

  const handleShare = async () => {
    if (shareState === 'sharing') {
      return;
    }

    setShareState('sharing');
    try {
      const outcome = await shareResult(buildSharePayload({
        theme: puzzleTheme,
        puzzleDate,
        attempts,
        solved,
        hintUsed,
      }, copy));
      setShareState(outcome === 'cancelled' ? null : outcome);
    } catch {
      setShareState('error');
    }
  };

  const shareLabel = shareState === 'sharing'
    ? copy.sharing
    : shareState === 'shared'
      ? copy.shareShared
      : shareState === 'copied'
        ? copy.shareCopied
        : copy.share;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    }}>
      <section className="result-card" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <button className="result-close" type="button" aria-label={copy.close} onClick={onClose} ref={closeButtonRef}>×</button>
        <p className="result-kicker">{solved ? copy.solvedKicker : copy.resultKicker}</p>
        <h2 id="result-title">{solved ? copy.solvedTitle : copy.resultTitle}</h2>
        <p className="result-rule">
          {solved
            ? interpolate(copy.solvedBody, { attempts })
            : interpolate(copy.resultRule, { dimension: reveal.hiddenDimension })}
        </p>
        <p className="result-explanation">{reveal.explanation}</p>
        <div className="result-groups">
          {reveal.groups.map((group) => (
            <article className="result-group" key={`${group.capacity}-${group.label}`}>
              <strong>{group.label}</strong>
              <span>{group.itemIds.map((itemId) => itemById.get(itemId) ?? itemId).join(' · ')}</span>
            </article>
          ))}
        </div>
        {reveal.sources.length > 0 && (
          <div className="result-sources">
            <p>{copy.sourceLabel}</p>
            <ul>
              {reveal.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {shareState === 'error' && (
          <p className="share-status share-status--error" role="alert">{copy.shareError}</p>
        )}
        {(shareState === 'shared' || shareState === 'copied') && (
          <p className="share-status" role="status" aria-live="polite">{shareState === 'shared' ? copy.shareShared : copy.shareCopied}</p>
        )}
        <div className="result-actions">
          {currentLevel < totalLevels && (
            <button className="button button-primary" type="button" onClick={onNextLevel}>
              {copy.nextLevel} →
            </button>
          )}
          <button className="button result-share-action" type="button" onClick={() => void handleShare()} disabled={shareState === 'sharing'}>
            {shareLabel}
          </button>
          <button className="button result-close-action" type="button" onClick={onClose}>{copy.close}</button>
        </div>
      </section>
    </div>
  );
}

interface LevelPickerModalProps {
  readonly copy: UiMessages;
  readonly summaries: readonly LevelSummary[];
  readonly currentLevel: number;
  readonly solvedFamilyIds: ReadonlySet<string>;
  readonly onSelectLevel: (level: number) => void;
  readonly onClose: () => void;
}

function LevelPickerModal({
  copy,
  summaries,
  currentLevel,
  solvedFamilyIds,
  onSelectLevel,
  onClose,
}: LevelPickerModalProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const total = summaries.length || TOTAL_LEVELS;
  const filtered = summaries.filter((item) => {
    if (!normalizedQuery) {
      return true;
    }
    return String(item.level).includes(normalizedQuery)
      || item.theme.toLowerCase().includes(normalizedQuery);
  });

  const handleNextUnsolved = () => {
    const after = summaries.find((item) => item.level > currentLevel && !solvedFamilyIds.has(item.puzzleFamilyId));
    const first = after ?? summaries.find((item) => !solvedFamilyIds.has(item.puzzleFamilyId));
    if (first) {
      onSelectLevel(first.level);
    }
  };

  const handleRandom = () => {
    if (summaries.length === 0) {
      return;
    }
    const idx = Math.floor(secureRandomFraction() * summaries.length);
    onSelectLevel(summaries[idx].level);
  };

  const difficultyLabel = (band: LevelSummary['difficulty']['band']): string => {
    if (band === 'easy') return copy.difficultyEasy;
    if (band === 'hard') return copy.difficultyHard;
    return copy.difficultyMedium;
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    }}>
      <section className="result-card level-picker-card" role="dialog" aria-modal="true" aria-labelledby="level-picker-title">
        <button className="result-close" type="button" aria-label={copy.close} onClick={onClose}>×</button>
        <p className="result-kicker">{interpolate(copy.completedProgress, { solved: solvedFamilyIds.size, total })}</p>
        <h2 id="level-picker-title">{copy.levelPickerTitle}</h2>

        <div className="level-picker-toolbar">
          <input
            className="level-search-input"
            type="search"
            value={query}
            placeholder={copy.levelSearchPlaceholder}
            aria-label={copy.levelSearchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="level-picker-quick">
            <button className="button" type="button" onClick={handleNextUnsolved}>
              {copy.nextUnsolved}
            </button>
            <button className="button" type="button" onClick={handleRandom}>
              {copy.randomLevel}
            </button>
          </div>
        </div>

        <div className="level-grid" role="list">
          {filtered.map((item) => {
            const isSolved = solvedFamilyIds.has(item.puzzleFamilyId);
            const isCurrent = item.level === currentLevel;
            return (
              <button
                key={item.puzzleFamilyId}
                type="button"
                role="listitem"
                className={`level-tile${isCurrent ? ' is-current' : ''}${isSolved ? ' is-solved' : ''}`}
                onClick={() => onSelectLevel(item.level)}
              >
                <span className="level-tile-num">#{item.level}</span>
                <span className="level-tile-theme">{item.theme}</span>
                <span className="level-tile-meta">
                  <span className={`difficulty-pill difficulty-pill--${item.difficulty.band}`}>
                    {difficultyLabel(item.difficulty.band)}
                  </span>
                  {isSolved && <span className="level-solved-mark">✓ {copy.levelSolvedLabel}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface ErrorPanelProps {
  readonly copy: UiMessages;
  readonly title: string;
  readonly message: string;
  readonly onRetry: () => void;
}

function ErrorPanel({ copy, title, message, onRetry }: ErrorPanelProps) {
  return (
    <section className="error-panel" role="alert">
      <p className="eyebrow">{copy.errorTitle}</p>
      <h2>{title}</h2>
      <p>{message}</p>
      <button className="button button-primary" type="button" onClick={onRetry}>{copy.retry}</button>
    </section>
  );
}

function ItemVisual({ item }: { readonly item: SafePuzzleItem }) {
  if (!item.visual) {
    return <span className="item-glyph" aria-hidden="true">✦</span>;
  }
  return item.visual.type === 'image'
    ? <img className="item-visual" src={item.visual.src} alt={item.visual.altText} />
    : <span className="item-glyph" aria-hidden="true">{item.visual.src}</span>;
}

function handleDragStart(
  event: DragEvent<HTMLButtonElement>,
  itemId: string,
  dispatch: PuzzleViewProps['onDispatch'],
): void {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', itemId);
  dispatch({ type: 'item/select', itemId });
}

function handleDrop(
  event: DragEvent<HTMLButtonElement>,
  rowId: RowId,
  slotIndex: number,
  dispatch: PuzzleViewProps['onDispatch'],
): void {
  event.preventDefault();
  const itemId = event.dataTransfer.getData('text/plain');
  if (itemId) {
    dispatch({ type: 'item/place', itemId, rowId, slotIndex });
  }
}

function feedbackMessage(
  state: PuzzleViewProps['state'],
  copy: UiMessages,
  itemById: ReadonlyMap<string, SafePuzzleItem>,
): string {
  if (!state.feedback) {
    return '';
  }
  if (state.feedback.kind === 'check') {
    return state.feedback.solved
      ? copy.solvedTitle
      : interpolate(copy.correctCount, { count: state.feedback.correctCount });
  }
  return interpolate(copy.hintPlaced, { item: itemById.get(state.feedback.itemId)?.label ?? state.feedback.itemId });
}

function localizeError(error: ApiErrorBody, copy: UiMessages): string {
  switch (error.code) {
    case 'PUZZLE_NOT_FOUND':
      return copy.noPuzzleError;
    case 'BOARD_INCOMPLETE':
      return copy.boardIncompleteError;
    case 'HINT_NOT_AVAILABLE':
      return copy.hintUnavailableError;
    case 'HINT_ALREADY_USED':
      return copy.hintAlreadyUsedError;
    case 'REQUEST_TIMEOUT':
      return copy.requestTimeoutError;
    case 'NETWORK_ERROR':
      return copy.networkError;
    case 'INVALID_API_RESPONSE':
      return copy.invalidResponseError;
    default:
      return error.message || copy.genericError;
  }
}

function toApiError(error: unknown): ApiErrorBody {
  if (error instanceof ApiRequestError && error.body) {
    return error.body;
  }
  if (error instanceof ApiRequestError) {
    return {
      code: 'REQUEST_FAILED',
      message: error.message,
      requestId: 'client',
    };
  }
  return {
    code: 'CLIENT_ERROR',
    message: error instanceof Error ? error.message : 'The puzzle could not be updated.',
    requestId: 'client',
  };
}

function interpolate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}

function shuffleIds(itemIds: readonly string[]): string[] {
  const result = [...itemIds];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const random = secureRandomFraction();
    const swapIndex = Math.floor(random * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function secureRandomFraction(): number {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] / 0x1_0000_0000;
  }
  return Math.random();
}

function createClientSessionId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `browser-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getInitialLocale(): Locale {
  const requested = normalizeLocale(new URLSearchParams(window.location.search).get('lang'));
  if (requested) {
    return requested;
  }
  try {
    const stored = normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
    if (stored) {
      return stored;
    }
  } catch {
    // Storage is optional; browser language is a safe fallback.
  }

  return 'en';
}

function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage is optional and should never block gameplay.
  }
}

function getLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function getInitialLevel(): number {
  const param = Number(new URLSearchParams(window.location.search).get('level'));
  if (Number.isInteger(param) && param >= 1 && param <= TOTAL_LEVELS) {
    return param;
  }
  try {
    const stored = Number(window.localStorage.getItem(CURRENT_LEVEL_STORAGE_KEY));
    if (Number.isInteger(stored) && stored >= 1 && stored <= TOTAL_LEVELS) {
      return stored;
    }
  } catch {
    // Storage is optional.
  }
  return 1;
}

function getInitialSolvedFamilies(): ReadonlySet<string> {
  try {
    const raw = window.localStorage.getItem(SOLVED_LEVELS_STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((item): item is string => typeof item === 'string'));
    }
  } catch {
    // Storage is optional.
  }
  return new Set();
}

function markFamilySolved(
  familyId: string,
  setSolvedFamilyIds: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>,
): void {
  setSolvedFamilyIds((prev) => {
    if (prev.has(familyId)) {
      return prev;
    }
    const next = new Set(prev);
    next.add(familyId);
    try {
      window.localStorage.setItem(SOLVED_LEVELS_STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Ignore storage write failures.
    }
    return next;
  });
}
