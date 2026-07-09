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
