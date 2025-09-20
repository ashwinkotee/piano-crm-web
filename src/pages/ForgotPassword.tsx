import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const MIN_PASSWORD = 8;

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [securityKey, setSecurityKey] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!email.trim()) {
      setStatus({ type: "error", message: "Email is required." });
      return;
    }
    if (securityKey.trim().length !== 6) {
      setStatus({ type: "error", message: "Security key must be the 6-digit code provided by the studio." });
      return;
    }
    if (pw1.length < MIN_PASSWORD) {
      setStatus({ type: "error", message: `New password must be at least ${MIN_PASSWORD} characters.` });
      return;
    }
    if (pw1 !== pw2) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setBusy(true);
    try {
      const res = await api.post("/auth/forgot-password", { email, securityKey, newPassword: pw1 });
      const data = res.data;
      if (!data?.ok) {
        throw new Error(data?.error || "Could not reset password.");
      }
      setStatus({ type: "ok", message: "Password updated. You can sign in with the new password." });
      setPw1("");
      setPw2("");
      setTimeout(() => nav("/login", { replace: true }), 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Could not reset password.";
      setStatus({ type: "error", message: msg });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0f1125] via-[#14143a] to-[#0b0d1d] text-white">
      <div className="absolute inset-0 opacity-10" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl md:text-3xl"
            style={{
              top: `${(i * 53) % 100}%`,
              left: `${(i * 37) % 100}%`,
              transform: `translate(-50%, -50%) rotate(${(i * 21) % 360}deg)`,
            }}
          >
            *
          </span>
        ))}
      </div>

      <form onSubmit={submit} className="relative z-10 w-[92%] max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="space-y-1">
          <div className="text-sm opacity-80">Reset portal password</div>
          <h1 className="text-2xl font-semibold leading-tight">Learn Music with Ashwin</h1>
          <p className="text-xs text-white/70">
            Enter the email used for your portal login, the 6-digit security key shared by the studio, and choose a new password.
          </p>
        </div>
        <input
          type="email"
          autoComplete="username"
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Security key"
          value={securityKey}
          onChange={(e) => setSecurityKey(e.target.value.replace(/[^0-9]/g, ""))}
        />
        <input
          type="password"
          autoComplete="new-password"
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="New password"
          value={pw1}
          onChange={(e) => setPw1(e.target.value)}
        />
        <input
          type="password"
          autoComplete="new-password"
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Confirm new password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
        />
        {status && (
          <div className={`text-sm ${status.type === "ok" ? "text-emerald-200" : "text-rose-300"}`}>
            {status.message}
          </div>
        )}
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-2.5 font-medium disabled:opacity-80 flex items-center justify-center gap-2 hover:bg-indigo-500 transition"
        >
          {busy && <span aria-hidden className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {busy ? "Updating..." : "Update password"}
        </button>
        <div className="text-xs text-center text-white/70">
          Remembered your password? <Link to="/login" className="underline">Back to sign in</Link>
        </div>
      </form>

      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}
