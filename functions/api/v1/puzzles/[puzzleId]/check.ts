import { evaluatePlacements } from '../../../../../src/domain/puzzle/engine';
import { D1PuzzleRepository } from '../../../../repositories/d1-puzzle-repository';
import {
  apiError,
  apiResponse,
  createRequestId,
  handleApiError,
  readJsonBody,
  requirePathParam,
} from '../../../../services/api';
import { parseCheckRequest } from '../../../../services/puzzle-request';
import type { PagesFunction, TensiftEnvironment } from '../../../../types';

export const onRequest: PagesFunction<TensiftEnvironment> = async ({ request, env, params }) => {
  const requestId = createRequestId();

  try {
    if (request.method !== 'POST') {
      return apiError(requestId, 'METHOD_NOT_ALLOWED', 'Use POST to check a puzzle.', 405);
    }

    const puzzleId = requirePathParam(params.puzzleId);
    if (!env.DB) {
      return apiError(requestId, 'INTERNAL_ERROR', 'The puzzle service is not configured in this environment.', 500);
    }

    const puzzle = await new D1PuzzleRepository(env.DB).findPuzzleById(puzzleId);
    if (!puzzle) {
      return apiError(requestId, 'PUZZLE_NOT_FOUND', 'The requested puzzle was not found.', 404);
    }

    const parsed = parseCheckRequest(await readJsonBody(request), puzzle);
    const evaluation = evaluatePlacements(puzzle, parsed.snapshot.byRow);
    if (!evaluation.complete) {
      return apiError(requestId, 'BOARD_INCOMPLETE', 'Place every item in a full board before checking.', 400);
    }

    return apiResponse({
      correctCount: evaluation.correctCount,
      solved: evaluation.solved,
      attemptAccepted: true,
    }, requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
};
