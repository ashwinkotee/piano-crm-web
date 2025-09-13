import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../store/auth";

export default function ChangePassword() {
  const nav = useNavigate();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(false);
    if (pw1.length < 8) { setErr("Password must be at least 8 characters"); return; }
    if (pw1 !== pw2) { setErr("Passwords do not match"); return; }
    setLoading(true);
    try {
      if (!token) throw new Error("Not authenticated");
      const res = await api.post("/auth/change-password", { newPassword: pw1 });
      if (res.status !== 200) throw new Error("Could not change password");
      setOk(true);
      setTimeout(() => nav("/portal"), 600);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Could not change password";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-card space-y-3">
        <div className="text-xl font-semibold">Update your password</div>
        <p className="text-sm text-slate-500">You’re using a temporary password. Please set a new one to continue.</p>
        <input className="w-full rounded-xl border px-3 py-2" type="password" placeholder="New password (min 8 chars)" value={pw1} onChange={e=>setPw1(e.target.value)} />
        <input className="w-full rounded-xl border px-3 py-2" type="password" placeholder="Confirm new password" value={pw2} onChange={e=>setPw2(e.target.value)} />
        {err && <div className="text-sm text-rose-600">{err}</div>}
        {ok && <div className="text-sm text-emerald-700">Password changed. Redirecting…</div>}
        <button disabled={loading} className="w-full rounded-xl bg-indigo-600 text-white px-3 py-2">
          {loading ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
