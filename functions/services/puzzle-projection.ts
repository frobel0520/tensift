import type {
  AuthoringPuzzleRecord,
  AuthoringPuzzleItem,
} from '../../src/domain/puzzle/authoring';
import type { RevealResponse, SafePuzzleDto, SafePuzzleItem } from '../../shared/contracts';

/**
 * Build the browser-facing puzzle DTO one field at a time. Keeping this
 * projection explicit is the answer-leakage boundary for the safe endpoint.
 */
export function toSafePuzzleDto(record: AuthoringPuzzleRecord): SafePuzzleDto {
  return {
    puzzleId: record.puzzleId,
    publishDate: record.publishDate,
    locale: record.locale,
    theme: record.theme,
    items: record.items.map(toSafePuzzleItem),
    rows: record.rows.map((row) => ({
      rowId: row.rowId,
      capacity: row.capacity,
    })),
    policy: {
      maxHints: 1,
      checks: 'unlimited',
    },
  };
}

/** Construct the explicit answer payload used only after a reveal request. */
export function toRevealResponse(record: AuthoringPuzzleRecord): RevealResponse {
  return {
    hiddenDimension: record.solution.hiddenDimension,
    groups: record.solution.groups.map((group) => ({
      label: group.label,
      capacity: group.capacity,
      itemIds: [...group.itemIds],
    })),
    explanation: record.explanation,
    sources: record.sources.map((source) => ({
      title: source.title,
      url: source.url,
    })),
  };
}

function toSafePuzzleItem(item: AuthoringPuzzleItem): SafePuzzleItem {
  if (!item.visual) {
    return {
      itemId: item.itemId,
      label: item.label,
    };
  }

  return {
    itemId: item.itemId,
    label: item.label,
    visual: {
      type: item.visual.type,
      src: item.visual.src,
      altText: item.visual.altText,
    },
  };
}
