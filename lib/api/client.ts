import { mapError } from "@/lib/api/mappers";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://frontend-task-chatapp.onrender.com/api";

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

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(path.startsWith("http") ? path : `${API_URL}${path}`);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Network failure. The API may be waking up — try again.", 0, "NETWORK");
  }

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
}
