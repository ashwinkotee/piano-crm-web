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
const initialLegacyToken = localStorage.getItem("token");

export const useAuth = create<AuthState>((set) => ({
  user: legacyUser,
  token: initialLegacyToken,
  setAuth: (token, user) => {
    // Persist auth so suspended/backgrounded tabs can rehydrate without logging out
    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } catch {}
    set({ token, user });
    try { scheduleRefreshFor(token); } catch {}
  },
  logout: async () => {
    try { await api.post("/auth/logout", {}); } catch {}
    try { localStorage.removeItem("token"); localStorage.removeItem("user"); } catch {}
    set({ token: null, user: null });
    try { clearScheduledRefresh(); } catch {}
  },
}));

// Rehydrate using refresh cookie when available; fall back to legacy token
export async function revalidateAuth() {
  const state = useAuth.getState();
  let refreshError: any = null;
  try {
    const r = await api.post("/auth/refresh", {}, {
      // @ts-ignore custom flag used by axiosAuth interceptor
      _skipAuthRefresh: true,
    } as any);
    const accessToken = r.data.accessToken as string;
    const me = await api.get("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } });
    state.setAuth(accessToken, me.data);
    try { localStorage.removeItem("token"); } catch {}
    return;
  } catch (err: any) {
    refreshError = err;
  }

  const status = refreshError?.response?.status as number | undefined;
  if (!status) {
    // Likely a network hiccup or the tab was offline; keep existing session state.
    return;
  }
  if (status >= 500) {
    return;
  }
  if (status !== 401 && status !== 403) {
    return;
  }

  const legacyToken = (() => {
    try { return localStorage.getItem("token"); } catch { return null; }
  })();
  if (!legacyToken) {
    await state.logout();
    return;
  }

  try {
    const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${legacyToken}` } });
    state.setAuth(legacyToken, res.data);
  } catch (err: any) {
    const fallbackStatus = err?.response?.status as number | undefined;
    if (fallbackStatus === 401 || fallbackStatus === 403) {
      await state.logout();
    }
  }
}

// --- Sliding-session auto refresh ---
let refreshTimer: number | null = null;
function clearScheduledRefresh() {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}
function scheduleRefreshFor(token: string) {
  clearScheduledRefresh();
  try {
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(atob(payloadB64));
    const expMs = (payload?.exp || 0) * 1000;
    const now = Date.now();
    // Refresh 60s before expiry; if already near expiry, refresh soon.
    let delay = expMs - now - 60_000;
    if (!isFinite(delay)) delay = 10 * 60_000; // fallback 10m
    if (delay < 5_000) delay = 5_000;
    refreshTimer = window.setTimeout(async () => {
      try { await revalidateAuth(); } catch {}
    }, delay);
  } catch {
    // Fallback: attempt refresh every 10m
    refreshTimer = window.setTimeout(async () => {
      try { await revalidateAuth(); } catch {}
    }, 10 * 60_000);
  }
}









