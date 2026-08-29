import { SUPPORTED_LOCALES, type Locale } from '../../../../shared/contracts';
import { D1PuzzleRepository } from '../../../repositories/d1-puzzle-repository';
import { apiError, apiResponse, createRequestId, handleApiError } from '../../../services/api';
import { toSafePuzzleDto } from '../../../services/puzzle-projection';
import type { PagesFunction, TensiftEnvironment } from '../../../types';

export const onRequest: PagesFunction<TensiftEnvironment> = async ({ request, env }) => {
  const requestId = createRequestId();

  try {
    if (request.method !== 'GET') {
      return apiError(requestId, 'METHOD_NOT_ALLOWED', 'Use GET to request today\'s puzzle.', 405);
    }

    const locale = new URL(request.url).searchParams.get('locale') ?? 'en';

    if (!isLocale(locale)) {
      return apiError(requestId, 'LOCALE_NOT_AVAILABLE', 'The requested locale is not supported.', 400);
    }

    if (!env.DB) {
      return apiError(requestId, 'INTERNAL_ERROR', 'The puzzle service is not configured in this environment.', 500);
    }

    const publishDate = new Date().toISOString().slice(0, 10);
    const puzzle = await new D1PuzzleRepository(env.DB).findReleasedPuzzle(locale, publishDate);
    if (!puzzle) {
      return apiError(requestId, 'PUZZLE_NOT_FOUND', 'No puzzle is available for the requested locale and date.', 404);
    }

    return apiResponse(
      toSafePuzzleDto(puzzle),
      requestId,
      200,
      {
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    );
  } catch (error) {
    return handleApiError(error, requestId);
  }
};

function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
