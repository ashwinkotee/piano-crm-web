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
    return () => { if (progressTimer.current !== null) clearInterval(progressTimer.current); };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
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
      setAuth(data.accessToken || data.token, data.user);
      if (data.user.role === "portal" && data.user.mustChangePassword) nav("/portal/change-password");
      else nav(data.user.role === "admin" ? "/admin" : "/portal/home", { replace: true });
    } catch (e:any) {
      setErr(e.message || "Login failed");
    } finally {
      if (progressTimer.current !== null) { clearInterval(progressTimer.current); progressTimer.current = null; }
      setTimeout(() => { setLoading(false); }, 300);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0f1125] via-[#14143a] to-[#0b0d1d]">
      {/* Decorative music notes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {new Array(18).fill(null).map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl md:text-3xl opacity-20 text-amber-200"
            style={{ top: `${(i * 53) % 100}%`, left: `${(i * 37) % 100}%`, transform: `translate(-50%, -50%) rotate(${(i * 23) % 360}deg)` }}
          >
            ♪
          </span>
        ))}
      </div>

      <form onSubmit={submit} className="relative z-10 w-[92%] max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-white space-y-4">
        <div>
          <div className="text-sm opacity-80">Welcome to</div>
          <div className="text-2xl font-semibold leading-tight">Learn Music with Ashwin</div>
        </div>
        <input type="email" autoComplete="username" className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" autoComplete="current-password" className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="text-sm text-rose-300">{err}</div>}
        <button
          disabled={loading}
          aria-busy={loading}
          className="w-full rounded-2xl bg-indigo-600 text-white px-4 py-2.5 disabled:opacity-80 flex items-center justify-center gap-2 hover:bg-indigo-500 transition"
        >
          {loading && (
            <span aria-hidden className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "Signing in." : "Sign in"}
        </button>
      </form>

      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

