import { jsonResponse } from '../types';

export const MAX_JSON_BODY_BYTES = 64 * 1024;

export class ApiInputError extends Error {
  public constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = 'ApiInputError';
  }
}

export function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function apiResponse(
  body: unknown,
  requestId: string,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return jsonResponse(body, status, {
    'Vary': 'Accept-Encoding',
    'X-Request-ID': requestId,
    ...headers,
  });
}

export function apiError(
  requestId: string,
  code: string,
  message: string,
  status: number,
): Response {
  return apiResponse({ code, message, requestId }, requestId, status);
}

export function handleApiError(error: unknown, requestId: string): Response {
  if (error instanceof ApiInputError) {
    return apiError(requestId, error.code, error.message, error.status);
  }

  return apiError(requestId, 'INTERNAL_ERROR', 'The puzzle service could not complete the request.', 500);
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    const parsedLength = Number(contentLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_JSON_BODY_BYTES) {
      throw new ApiInputError('REQUEST_TOO_LARGE', 'Request body is too large.', 413);
    }
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    throw new ApiInputError('INVALID_REQUEST', 'Request body could not be read.');
  }

  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BODY_BYTES) {
    throw new ApiInputError('REQUEST_TOO_LARGE', 'Request body is too large.', 413);
  }

  if (text.trim().length === 0) {
    throw new ApiInputError('INVALID_REQUEST', 'Request body must be valid JSON.');
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiInputError('INVALID_REQUEST', 'Request body must be valid JSON.');
  }
}

export function requirePathParam(
  value: string | undefined,
  code = 'PUZZLE_NOT_FOUND',
  message = 'The requested puzzle was not found.',
): string {
  if (typeof value === 'string' && value.trim().length > 0 && value.length <= 160) {
    return value;
  }

  throw new ApiInputError(code, message, 404);
}

export function requireClientSessionId(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0 && value.length <= 128) {
    return value;
  }

  throw new ApiInputError('INVALID_REQUEST', 'clientSessionId must be a non-empty string.');
}

export function requireIdempotencyKey(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0 && value.length <= 128) {
    return value;
  }

  throw new ApiInputError('INVALID_REQUEST', 'idempotencyKey must be a non-empty string.');
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
