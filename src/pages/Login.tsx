import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Login() {
  const nav = useNavigate();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const progressTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimer.current !== null) {
        clearInterval(progressTimer.current);
      }
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    if (progressTimer.current !== null) clearInterval(progressTimer.current);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Persist and update auth store so Protected routes see the new state
      setAuth(data.accessToken || data.token, data.user);

      // Success: navigate to the appropriate area
      if (data.user.role === "portal" && data.user.mustChangePassword) {
        nav("/portal/change-password");
      } else {
        // Send portal users straight to Home; admins to their home
        nav(data.user.role === "admin" ? "/admin" : "/portal/home", { replace: true });
      }
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      if (progressTimer.current !== null) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
      setTimeout(() => { setLoading(false); }, 300);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-card space-y-3 text-slate-900">
        <div className="text-xl font-semibold">Sign in</div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs p-3">
          First-time sign-in may take up to a minute while the server starts.
          Thank you for your patience.
        </div>
        <input className="w-full rounded-xl border px-3 py-2 text-slate-900 placeholder:text-slate-400" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-xl border px-3 py-2 text-slate-900 placeholder:text-slate-400" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <button
          disabled={loading}
          aria-busy={loading}
          className="w-full rounded-xl bg-indigo-600 text-white px-3 py-2 disabled:opacity-80 flex items-center justify-center gap-2"
          
        >
          {loading && (
            <span aria-hidden="true" className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
