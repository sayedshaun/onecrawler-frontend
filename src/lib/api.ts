export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let getAuthToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

// Set by the auth store, which apiFetch cannot import directly without a circular dependency.
export function configureApiAuth(deps: { getToken: () => string | null; onUnauthorized: () => void }): void {
  getAuthToken = deps.getToken;
  onUnauthorized = deps.onUnauthorized;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      // Skips ngrok's browser-warning interstitial (an HTML page in place of the
      // real response) when /api is rewritten to an ngrok tunnel in production.
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401) onUnauthorized();
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // response had no JSON body — fall back to statusText
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Fetches a file endpoint and triggers a browser download, reading the
 * filename from Content-Disposition when the server sets one. */
export async function apiDownload(path: string, fallbackFilename: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(path, {
    headers: {
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401) onUnauthorized();
    throw new ApiError(res.statusText, res.status);
  }

  const disposition = res.headers.get("Content-Disposition");
  const filename = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i)?.[1] ?? fallbackFilename;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = decodeURIComponent(filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
