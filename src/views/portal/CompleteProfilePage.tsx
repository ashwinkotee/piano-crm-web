import { useEffect, useState } from "react";
import { getMyStudents } from "../../hooks/students";
import { api } from "../../lib/api";

type MyStudent = {
  _id: string;
  name: string;
  ageGroup?: string;
  address?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentPhone?: string;
};

export default function CompleteProfilePage() {
  const [students, setStudents] = useState<MyStudent[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [form, setForm] = useState({ address: "", dateOfBirth: "", parentName: "", parentPhone: "", ageGroup: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const list = await getMyStudents();
      setStudents(list);
      if (list.length > 0) {
        setSelected(list[0]._id);
        setForm({
          address: list[0].address || "",
          dateOfBirth: list[0].dateOfBirth ? list[0].dateOfBirth.slice(0, 10) : "",
          parentName: list[0].parentName || "",
          parentPhone: list[0].parentPhone || "",
          ageGroup: list[0].ageGroup || "",
        });
      }
    })();
  }, []);

  function choose(id: string) {
    setSelected(id);
    const s = students.find((x) => x._id === id);
    if (!s) return;
    setForm({
      address: s.address || "",
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : "",
      parentName: s.parentName || "",
      parentPhone: s.parentPhone || "",
      ageGroup: s.ageGroup || "",
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.post("/students/me/profile", {
        studentId: selected,
        address: form.address || undefined,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
        parentName: form.parentName || undefined,
        parentPhone: form.parentPhone || undefined,
        ageGroup: form.ageGroup || undefined,
      });
      setMessage("Saved. Thank you!");
    } catch (e: any) {
      setMessage(e?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold text-white">Complete your profile</div>
      {students.length === 0 && <div className="text-slate-300">No students linked to this account.</div>}
      {students.length > 0 && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <label className="text-sm text-slate-200">
            <div className="mb-1 text-xs text-slate-400">Student</div>
            <select
              value={selected}
              onChange={(e) => choose(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </label>
          <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={(v) => setForm({ ...form, dateOfBirth: v })} />
          <Field label="Parent/Guardian name" value={form.parentName} onChange={(v) => setForm({ ...form, parentName: v })} />
          <Field label="Parent/Guardian phone" value={form.parentPhone} onChange={(v) => setForm({ ...form, parentPhone: v })} />
          <label className="text-sm text-slate-200">
            <div className="mb-1 text-xs text-slate-400">Age group</div>
            <select
              value={form.ageGroup}
              onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              <option value="">Select</option>
              <option value="6-9">6-9</option>
              <option value="10-14">10-14</option>
              <option value="15+">15+</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {message && <div className="text-sm text-slate-200">{message}</div>}
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="text-sm text-slate-200">
      <div className="mb-1 text-xs text-slate-400">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
      />
    </label>
  );
}
