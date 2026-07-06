import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiFetch } from "@/lib/api";
import { decodeJwt, isExpired } from "@/lib/jwt";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  userType: string;
}

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

function userFromToken(token: string): AuthUser {
  const claims = decodeJwt(token);
  if (!claims) throw new Error("Received an invalid session token");
  return { id: claims.sub, name: claims.name, email: claims.email, userType: claims.user_type };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: async (email, password) => {
        const res = await apiFetch<TokenResponse>("/api/users/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        set({ token: res.accessToken, user: userFromToken(res.accessToken) });
      },

      register: async (name, email, password) => {
        await apiFetch("/api/users/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        await get().login(email, password);
      },

      logout: async () => {
        const token = get().token;
        set({ token: null, user: null });
        if (!token) return;
        try {
          await apiFetch("/api/users/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // best-effort — local session is already cleared either way
        }
      },
    }),
    { name: "onecrawler-auth" },
  ),
);

export function selectIsAuthenticated(state: AuthStore): boolean {
  if (!state.token || !state.user) return false;
  const claims = decodeJwt(state.token);
  return claims !== null && !isExpired(claims);
}

export function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
