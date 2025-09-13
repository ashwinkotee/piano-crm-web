import { useEffect, useState } from "react";
import { getMyStudents, type Student } from "../../hooks/students";
import { useAuth } from "../../store/auth";
import { api } from "../../lib/api";
import Modal from "../../components/ui/Modal";

export default function ProfilePage() {
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { user } = useAuth();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getMyStudents();
        if (mounted) setItems(list);
      } catch (e: any) {
        setErr(e?.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-slate-500">Loading.</div>;
  if (err) return <div className="text-rose-600">{err}</div>;

  if (items.length === 0) {
    return <div className="text-slate-500">No profile data found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Change Password trigger */}
      <div className="card-neutral rounded-2xl p-4 shadow-sm">
        <div className="mb-2 text-lg font-semibold">Security</div>
        <button
          onClick={() => { setPwMsg(null); setPw1(""); setPw2(""); setShowPw(true); }}
          className="rounded-xl bg-indigo-600 px-3 py-2 text-white"
        >
          Change Password
        </button>
      </div>

      {showPw && (
        <Modal title="Change Password" onClose={() => setShowPw(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setPwMsg(null);
              if (pw1.length < 8) { setPwMsg("Password must be at least 8 characters"); return; }
              if (pw1 !== pw2) { setPwMsg("Passwords do not match"); return; }
              setPwLoading(true);
              try {
                await api.post("/auth/change-password", { newPassword: pw1 });
                setPwMsg("Password updated successfully.");
                setPw1(""); setPw2("");
                setTimeout(() => setShowPw(false), 700);
              } catch (err: any) {
                setPwMsg(err?.response?.data?.error || err?.message || "Failed to change password");
              } finally {
                setPwLoading(false);
              }
            }}
            className="space-y-3"
          >
            <input
              className="w-full rounded-xl border px-3 py-2"
              type="password"
              placeholder="New password (min 8 chars)"
              value={pw1}
              onChange={(e)=>setPw1(e.target.value)}
            />
            <input
              className="w-full rounded-xl border px-3 py-2"
              type="password"
              placeholder="Confirm new password"
              value={pw2}
              onChange={(e)=>setPw2(e.target.value)}
            />
            {pwMsg && (
              <div className={"text-sm " + (pwMsg.includes("successfully") ? "text-emerald-700" : "text-rose-600")}>{pwMsg}</div>
            )}
            <div className="flex items-center gap-2">
              <button disabled={pwLoading} className="rounded-xl bg-indigo-600 px-3 py-2 text-white">
                {pwLoading ? "Saving." : "Save"}
              </button>
              <button type="button" onClick={()=>setShowPw(false)} className="rounded-xl border px-3 py-2">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {items.map((s) => (
        <div key={s._id} className="card-neutral rounded-2xl p-4 shadow-sm">
          <div className="mb-2 text-lg font-semibold">{s.name}</div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" value={s.name} />
            <Field label="Class Type" value={s.program} />
            <Field label="Email" value={user?.email || "-"} />
            <Field label="Date of Birth" value={s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : "-"} />
            <Field label="Address" value={s.address || "-"} />
            <Field label="Parent/guardian Name" value={s.parentName || "-"} />
            <Field label="Phone Number" value={s.parentPhone || "-"} />
          </dl>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value }:{ label: string; value: string }){
  return (
    <div>
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
