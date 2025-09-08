import { useEffect, useState } from "react";
import { getMyStudents, type Student } from "../../hooks/students";
import { useAuth } from "../../store/auth";

export default function ProfilePage() {
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { user } = useAuth();

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
