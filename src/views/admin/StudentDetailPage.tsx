import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getStudent, type Student, updateStudent } from "../../hooks/students";
import { useStudentHomework, addHomework, updateHomework, deleteHomework, type Homework } from "../../hooks/homework";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

export default function StudentDetailPage() {
  const { id = "" } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getStudent(id);
        if (mounted) setStudent(s);
      } catch (e: any) {
        setErr(e?.response?.data?.error || "Failed to load student");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="text-slate-500">Loading.</div>;
  if (err) return <div className="text-rose-600">{err}</div>;
  if (!student) return <div className="text-slate-500">Not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">{student.name}</div>
          <div className="text-sm text-slate-500">Student details</div>
        </div>
        <div className="flex items-center gap-2">
          <EditStudentButton student={student} onSaved={async()=>{ const s = await getStudent(student._id); setStudent(s); }} />
          <Link to="/admin/students" className="rounded-xl border px-3 py-2 hover:bg-slate-50">Back</Link>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" value={student.name} />
          <Field label="Class Type" value={student.program} />
          <Field label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-"} />
          <Field label="Address" value={student.address || "-"} />
          <Field label="Parent/guardian Name" value={student.parentName || "-"} />
          <Field label="Phone Number" value={student.parentPhone || "-"} />
        </dl>
      </div>

      <StudentHomework studentId={student._id} />
    </div>
  );
}

function Field({ label, value }:{ label: string; value: string }){
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function EditStudentButton({ student, onSaved }:{ student: Student; onSaved: ()=>void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={()=>setOpen(true)}>Edit</Button>
      {open && <EditStudentModal student={student} onClose={()=>setOpen(false)} onSaved={async()=>{ setOpen(false); await onSaved(); }} />}
    </>
  );
}

function EditStudentModal({ student, onClose, onSaved }:{ student: Student; onClose: ()=>void; onSaved: ()=>void }) {
  const [name, setName] = useState(student.name);
  const [address, setAddress] = useState(student.address || "");
  const [dateOfBirth, setDateOfBirth] = useState(student.dateOfBirth ? student.dateOfBirth.slice(0,10) : "");
  const [parentName, setParentName] = useState(student.parentName || "");
  const [parentPhone, setParentPhone] = useState(student.parentPhone || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function submit(e: React.FormEvent){
    e.preventDefault(); setErr(null); setSaving(true);
    try {
      await updateStudent(student._id, {
        name,
        address: address || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
        parentName: parentName || undefined,
        parentPhone: parentPhone || undefined,
      } as any);
      onSaved();
    } catch (e:any) { setErr(e?.response?.data?.error || "Could not save"); setSaving(false); }
  }

  return (
    <Modal title="Edit Student" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded-xl border px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full rounded-xl border px-3 py-2" placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="text-sm">
            <div className="text-slate-600">Date of Birth</div>
            <input type="date" className="w-full rounded-xl border px-3 py-2" value={dateOfBirth} onChange={e=>setDateOfBirth(e.target.value)} />
          </label>
          <label className="text-sm">
            <div className="text-slate-600">Parent/guardian name</div>
            <input className="w-full rounded-xl border px-3 py-2" value={parentName} onChange={e=>setParentName(e.target.value)} />
          </label>
          <label className="text-sm">
            <div className="text-slate-600">Parent/guardian phone</div>
            <input className="w-full rounded-xl border px-3 py-2" value={parentPhone} onChange={e=>setParentPhone(e.target.value)} />
          </label>
        </div>
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button disabled={saving}>{saving ? "Saving." : "Save"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function StudentHomework({ studentId }:{ studentId: string }){
  const { items, loading, error, refresh } = useStudentHomework(studentId);
  const [openAdd, setOpenAdd] = useState(false);
  const [editItem, setEditItem] = useState<Homework | null>(null);
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">Homework</div>
        <Button onClick={()=>setOpenAdd(true)}>Add Homework</Button>
      </div>
      {loading ? <div className="text-slate-500">Loading.</div>
        : error ? <div className="text-rose-600">{error}</div>
        : items.length === 0 ? <div className="text-slate-500">No homework yet.</div>
        : (
          <ul className="divide-y divide-slate-200">
            {items.map(h => (
              <li key={h._id} className="flex flex-col items-start justify-between gap-2 py-2 sm:flex-row sm:items-center">
                <div className="text-sm">
                  <div className="font-medium">{h.text}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${h.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{h.status}</span>
                  <Button variant="secondary" size="sm" onClick={()=>setEditItem(h)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={async()=>{
                    if (!confirm('Delete this homework?')) return;
                    await deleteHomework(h._id);
                    await refresh();
                  }}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      {openAdd && <AddHomeworkModal studentId={studentId} onClose={()=>setOpenAdd(false)} onSaved={async()=>{ setOpenAdd(false); await refresh(); }} />}
      {editItem && <EditHomeworkModal item={editItem} onClose={()=>setEditItem(null)} onSaved={async()=>{ setEditItem(null); await refresh(); }} />}
    </div>
  );
}

function AddHomeworkModal({ studentId, onClose, onSaved }:{ studentId: string; onClose: ()=>void; onSaved: ()=>void }){
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  async function submit(e: React.FormEvent){
    e.preventDefault(); setErr(null); setSaving(true);
    try { await addHomework(studentId, text); onSaved(); }
    catch(e:any){ setErr(e?.response?.data?.error || 'Could not add'); setSaving(false); }
  }
  return (
    <Modal title="Add Homework" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <textarea rows={4} className="w-full rounded-xl border px-3 py-2" value={text} onChange={e=>setText(e.target.value)} placeholder="Type homework details..." />
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button disabled={saving}>{saving ? 'Saving.' : 'Add'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function EditHomeworkModal({ item, onClose, onSaved }:{ item: Homework; onClose: ()=>void; onSaved: ()=>void }){
  const [text, setText] = useState(item.text);
  const [status, setStatus] = useState<Homework["status"]>(item.status);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  async function submit(e: React.FormEvent){
    e.preventDefault(); setErr(null); setSaving(true);
    try { await updateHomework(item._id, { text, status }); onSaved(); }
    catch(e:any){ setErr(e?.response?.data?.error || 'Could not save'); setSaving(false); }
  }
  return (
    <Modal title="Edit Homework" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <textarea rows={4} className="w-full rounded-xl border px-3 py-2" value={text} onChange={e=>setText(e.target.value)} />
        <label className="text-sm">
          <div className="text-slate-600">Status</div>
          <select className="w-full rounded-xl border px-3 py-2" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option>Assigned</option>
            <option>Completed</option>
          </select>
        </label>
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button disabled={saving}>{saving ? 'Saving.' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}

