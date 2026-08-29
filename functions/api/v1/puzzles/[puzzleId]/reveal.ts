import { D1PuzzleRepository } from '../../../../repositories/d1-puzzle-repository';
import {
  apiError,
  apiResponse,
  createRequestId,
  handleApiError,
  readJsonBody,
  requirePathParam,
} from '../../../../services/api';
import { parseRevealRequest } from '../../../../services/puzzle-request';
import { toRevealResponse } from '../../../../services/puzzle-projection';
import type { PagesFunction, TensiftEnvironment } from '../../../../types';

export const onRequest: PagesFunction<TensiftEnvironment> = async ({ request, env, params }) => {
  const requestId = createRequestId();

  try {
    if (request.method !== 'POST') {
      return apiError(requestId, 'METHOD_NOT_ALLOWED', 'Use POST to reveal a puzzle.', 405);
    }

    const puzzleId = requirePathParam(
      params.puzzleId,
      'REVEAL_NOT_AVAILABLE',
      'The answer is not available for this puzzle.',
    );
    if (!env.DB) {
      return apiError(requestId, 'INTERNAL_ERROR', 'The puzzle service is not configured in this environment.', 500);
    }

    const puzzle = await new D1PuzzleRepository(env.DB).findPuzzleById(puzzleId);
    if (!puzzle) {
      return apiError(requestId, 'REVEAL_NOT_AVAILABLE', 'The answer is not available for this puzzle.', 409);
    }

    parseRevealRequest(await readJsonBody(request));
    return apiResponse(toRevealResponse(puzzle), requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
};
