import { mapError } from "@/lib/api/mappers";

/** Same-origin path; Next rewrites `/backend/*` to the Render host (avoids CORS on Vercel). */
export const API_URL = "/backend/api";

export class ApiError extends Error {
  status: number;
  code: string | null;
  details: { path: string; message: string }[];

  constructor(
    message: string,
    status: number,
    code: string | null = null,
    details: { path: string; message: string }[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

function resolveUrl(path: string, query?: RequestOptions["query"]) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
  const url = new URL(path.startsWith("http") ? path : `${API_URL}${path}`, origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function fetchOnce(url: URL, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  return fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = resolveUrl(path, options.query);
  const attempts = 3;
  let lastNetwork: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetchOnce(url, options);
      const raw = await response.text();
      let parsed: unknown = null;
      if (raw) {
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
      }

      if (!response.ok) {
        const err = mapError(parsed, response.statusText || "Request failed");
        throw new ApiError(err.message, response.status, err.code, err.details);
      }

      return parsed as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      lastNetwork = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      }
    }
  }

  throw new ApiError(
    "Network failure. The API may be waking up — try again.",
    0,
    "NETWORK",
    lastNetwork instanceof Error ? [{ path: "network", message: lastNetwork.message }] : [],
  );
}
