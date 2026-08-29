import type {
  ApiErrorBody,
  CheckRequest,
  CheckResponse,
  HintRequest,
  HintResponse,
  Locale,
  RevealResponse,
  SafePuzzleDto,
} from './contracts';
import {
  ApiProtocolError,
  parseCheckResponse,
  parseHintResponse,
  parseRevealResponse,
  parseSafePuzzleDto,
} from './validation';

export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly body: ApiErrorBody | null;

  public constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

export interface TensiftApiClient {
  getToday(locale: Locale): Promise<SafePuzzleDto>;
  check(puzzleId: string, request: CheckRequest): Promise<CheckResponse>;
  hint(puzzleId: string, request: HintRequest): Promise<HintResponse>;
  reveal(puzzleId: string, clientSessionId: string): Promise<RevealResponse>;
}

interface FetchResponseLike {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
}

type FetchImplementation = (input: RequestInfo | URL, init?: RequestInit) => Promise<FetchResponseLike>;

const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const CLIENT_PROTOCOL_ERROR: ApiErrorBody = {
  code: 'INVALID_API_RESPONSE',
  message: 'The puzzle service returned an invalid response.',
  requestId: 'client',
};
const NETWORK_ERROR: ApiErrorBody = {
  code: 'NETWORK_ERROR',
  message: 'The puzzle service could not be reached. Check your connection and try again.',
  requestId: 'client',
};

export function createApiClient(
  baseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
  fetchImplementation: FetchImplementation = fetch,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
): TensiftApiClient {
  const requestJson = async <ResponseBody>(path: string, init?: RequestInit): Promise<ResponseBody> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    let response: FetchResponseLike;

    try {
      response = await fetchImplementation(`${baseUrl}${path}`, {
        ...init,
        signal: init?.signal ?? controller.signal,
        headers: {
          Accept: 'application/json',
          ...(init?.body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...init?.headers,
        },
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (isAbortError(error)) {
        throw new ApiRequestError(408, {
          code: 'REQUEST_TIMEOUT',
          message: 'The puzzle service took too long to respond. Try again.',
          requestId: 'client',
        });
      }
      throw new ApiRequestError(0, NETWORK_ERROR);
    }
    clearTimeout(timeoutId);

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiRequestError(
        response.status,
        isApiErrorBody(body) ? body : null,
      );
    }

    return body as ResponseBody;
  };

  return {
    getToday: async (locale) => parseResponse(
      await requestJson<unknown>(`/api/v1/puzzles/today?locale=${encodeURIComponent(locale)}`),
      parseSafePuzzleDto,
    ),
    check: async (puzzleId, request) => parseResponse(
      await requestJson<unknown>(`/api/v1/puzzles/${encodeURIComponent(puzzleId)}/check`, {
        method: 'POST',
        body: JSON.stringify(request),
      }),
      parseCheckResponse,
    ),
    hint: async (puzzleId, request) => parseResponse(
      await requestJson<unknown>(`/api/v1/puzzles/${encodeURIComponent(puzzleId)}/hint`, {
        method: 'POST',
        body: JSON.stringify(request),
      }),
      parseHintResponse,
    ),
    reveal: async (puzzleId, clientSessionId) => parseResponse(
      await requestJson<unknown>(`/api/v1/puzzles/${encodeURIComponent(puzzleId)}/reveal`, {
        method: 'POST',
        body: JSON.stringify({ clientSessionId }),
      }),
      parseRevealResponse,
    ),
  };
}

function parseResponse<ResponseBody>(value: unknown, parser: (value: unknown) => ResponseBody): ResponseBody {
  try {
    return parser(value);
  } catch (error) {
    if (error instanceof ApiProtocolError) {
      throw new ApiRequestError(502, CLIENT_PROTOCOL_ERROR);
    }
    throw error;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.code === 'string'
    && typeof candidate.message === 'string'
    && typeof candidate.requestId === 'string';
}
