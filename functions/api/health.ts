import { apiError, apiResponse, createRequestId } from '../services/api';
import type { PagesFunction, TensiftEnvironment } from '../types';

export const onRequest: PagesFunction<TensiftEnvironment> = async ({ request, env }) => {
  const requestId = createRequestId();

  if (request.method !== 'GET') {
    return apiError(requestId, 'METHOD_NOT_ALLOWED', 'Use GET to request service health.', 405);
  }

  if (!env.DB) {
    return apiResponse({
      status: 'degraded',
      release: env.RELEASE_ID ?? 'local',
      puzzleCatalogVersion: 'unavailable',
      requestId,
    }, requestId, 503);
  }

  try {
    const row = await env.DB
      .prepare('SELECT COUNT(*) AS puzzle_count FROM puzzles')
      .first<{ readonly puzzle_count: number }>();
    const puzzleCount = row?.puzzle_count ?? 0;

    return apiResponse({
      status: 'ok',
      release: env.RELEASE_ID ?? 'local',
      puzzleCatalogVersion: puzzleCount > 0 ? 'd1' : 'empty',
      requestId,
    }, requestId);
  } catch {
    return apiResponse({
      status: 'degraded',
      release: env.RELEASE_ID ?? 'local',
      puzzleCatalogVersion: 'unavailable',
      requestId,
    }, requestId, 503);
  }
};
