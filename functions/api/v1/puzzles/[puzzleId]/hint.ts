import { chooseHintCandidate } from '../../../../../src/domain/puzzle/engine';
import { D1PuzzleRepository } from '../../../../repositories/d1-puzzle-repository';
import {
  apiError,
  apiResponse,
  createRequestId,
  handleApiError,
  isRecord,
  readJsonBody,
  requirePathParam,
} from '../../../../services/api';
import { parseHintRequest, secureRandomIndex } from '../../../../services/puzzle-request';
import type { PagesFunction, TensiftEnvironment } from '../../../../types';
import type { HintResponse, RowId } from '../../../../../shared/contracts';

export const onRequest: PagesFunction<TensiftEnvironment> = async ({ request, env, params }) => {
  const requestId = createRequestId();

  try {
    if (request.method !== 'POST') {
      return apiError(requestId, 'METHOD_NOT_ALLOWED', 'Use POST to request a hint.', 405);
    }

    const puzzleId = requirePathParam(params.puzzleId);
    if (!env.DB) {
      return apiError(requestId, 'INTERNAL_ERROR', 'The puzzle service is not configured in this environment.', 500);
    }

    const repository = new D1PuzzleRepository(env.DB);
    const puzzle = await repository.findPuzzleById(puzzleId);
    if (!puzzle) {
      return apiError(requestId, 'PUZZLE_NOT_FOUND', 'The requested puzzle was not found.', 404);
    }

    const parsed = parseHintRequest(await readJsonBody(request), puzzle);
    const now = new Date().toISOString();
    const existingReceipt = await repository.findActionReceipt(
      puzzleId,
      parsed.request.clientSessionId,
      'hint',
      now,
    );
    if (existingReceipt) {
      if (existingReceipt.idempotencyKey !== parsed.request.idempotencyKey) {
        return apiError(requestId, 'HINT_ALREADY_USED', 'This session has already used its hint.', 409);
      }
      return apiResponse(parseHintReceipt(existingReceipt.responseJson, puzzle), requestId);
    }

    const candidate = chooseHintCandidate(
      puzzle,
      parsed.snapshot.byRow,
      parsed.lockedItemIds,
      secureRandomIndex,
    );
    if (!candidate) {
      return apiError(requestId, 'HINT_NOT_AVAILABLE', 'No eligible item is available for a hint.', 409);
    }

    const response: HintResponse = {
      itemId: candidate.itemId,
      rowId: candidate.rowId,
      hintAccepted: true,
    };
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await repository.insertActionReceipt(
      puzzleId,
      parsed.request.clientSessionId,
      'hint',
      parsed.request.idempotencyKey,
      JSON.stringify(response),
      expiresAt,
      now,
    );

    const committedReceipt = await repository.findActionReceipt(
      puzzleId,
      parsed.request.clientSessionId,
      'hint',
      now,
    );
    if (committedReceipt && committedReceipt.idempotencyKey !== parsed.request.idempotencyKey) {
      return apiError(requestId, 'HINT_ALREADY_USED', 'This session has already used its hint.', 409);
    }

    return apiResponse(
      committedReceipt ? parseHintReceipt(committedReceipt.responseJson, puzzle) : response,
      requestId,
    );
  } catch (error) {
    return handleApiError(error, requestId);
  }
};

function parseHintReceipt(value: string, puzzle: { readonly items: readonly { readonly itemId: string }[] }): HintResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    throw new Error('Stored hint receipt is not valid JSON.');
  }

  if (!isRecord(parsed)
    || typeof parsed.itemId !== 'string'
    || !new Set(puzzle.items.map((item) => item.itemId)).has(parsed.itemId)
    || !isRowId(parsed.rowId)
    || parsed.hintAccepted !== true) {
    throw new Error('Stored hint receipt does not match the response contract.');
  }

  return {
    itemId: parsed.itemId,
    rowId: parsed.rowId,
    hintAccepted: true,
  };
}

function isRowId(value: unknown): value is RowId {
  return value === 'row-1' || value === 'row-2' || value === 'row-3' || value === 'row-4';
}
