// store/auth.ts
import { create } from "zustand";
import { api } from "../lib/api"; // axios instance with baseURL

type User = { id?: string; _id?: string; email: string; role: "admin" | "portal"; mustChangePassword?: boolean };

type AuthState = {
  user: User | null;
  token: string | null; // in-memory access token
  setAuth: (token: string, user: User) => void;
  logout: () => Promise<void>;
};

// Migration note: read legacy localStorage once, then stop persisting going forward
const legacyUser = (() => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
})();
const legacyToken = localStorage.getItem("token");

export const useAuth = create<AuthState>((set) => ({
  user: legacyUser,
  token: legacyToken,
  setAuth: (token, user) => {
    // Stop persisting tokens to storage; keep in memory only
    try { localStorage.setItem("user", JSON.stringify(user)); } catch {}
    set({ token, user });
  },
  logout: async () => {
    try { await api.post("/auth/logout", {}); } catch {}
    try { localStorage.removeItem("token"); localStorage.removeItem("user"); } catch {}
    set({ token: null, user: null });
  },
}));

// Rehydrate using refresh cookie when available; fall back to legacy token
export async function revalidateAuth() {
  try {
    // Prefer refresh cookie flow
    const r = await api.post("/auth/refresh", {}, { // mark to skip 401 refresh loop
      // @ts-ignore custom flag used by axiosAuth interceptor
      _skipAuthRefresh: true,
    } as any);
    const accessToken = r.data.accessToken as string;
    const me = await api.get("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } });
    useAuth.getState().setAuth(accessToken, me.data);
    // Clean legacy storage
    try { localStorage.removeItem("token"); } catch {}
    return;
  } catch {}

  // Fallback: legacy token if present
  const token = legacyToken;
  if (!token) {
    await useAuth.getState().logout();
    return;
  }
  try {
    const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    useAuth.getState().setAuth(token, res.data);
  } catch {
    await useAuth.getState().logout();
  }
}
