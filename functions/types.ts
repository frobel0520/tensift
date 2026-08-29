export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ readonly results: readonly T[] }>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface TensiftEnvironment {
  readonly DB?: D1Database;
  readonly RELEASE_ID?: string;
  /** Public AdSense publisher ID used only for the root ads.txt response. */
  readonly ADSENSE_PUBLISHER_ID?: string;
}

export interface PagesFunctionContext<Environment> {
  readonly request: Request;
  readonly env: Environment;
  readonly params: Record<string, string | undefined>;
  readonly next: () => Promise<Response>;
}

export type PagesFunction<Environment> = (
  context: PagesFunctionContext<Environment>
) => Response | Promise<Response>;

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}
