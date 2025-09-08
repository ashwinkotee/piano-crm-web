import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getStudent, type Student, updateStudent, createSibling } from "../../hooks/students";
import { useGroups, addGroupMembers } from "../../hooks/groups";
import { useStudentHomework, addHomework, updateHomework, deleteHomework, type Homework } from "../../hooks/homework";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

type StudentWithPortal = Student & { portalUser?: { email?: string } };

export default function StudentDetailPage() {
  const { id = "" } = useParams();
  const [student, setStudent] = useState<StudentWithPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { data: groups } = useGroups();

  const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;
  const displaySlot = useMemo(() => {
    const slot: any = (student as any)?.defaultSlot;
    if (!slot || typeof slot.weekday !== 'number' || !slot.time) return '-';
    const wd = WEEKDAYS[slot.weekday] || '';
    return `${wd} ${slot.time}`;
  }, [student]);

  const groupNames = useMemo(() => {
    if (!student) return '-';
    const names = groups.filter(g => g.memberIds.includes(student._id)).map(g => g.name);
    return names.length ? names.join(', ') : '-';
  }, [groups, student]);

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
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-xl font-semibold">{student.name}</div>
            {student.termsAccepted ? (
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Accepted</span>
            ) : (
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Not accepted</span>
            )}
          </div>
          <div className="text-sm text-slate-500">Student details</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              Fee: ${student.monthlyFee ?? 0}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${student.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
              {student.active ? 'Active' : 'Inactive'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              Slot: {displaySlot}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddSiblingButton baseStudent={student} onAdded={async(sid)=>{ /* reload to reflect sibling presence if needed */ setNotice('Sibling added successfully.'); setTimeout(()=>setNotice(null), 3000); }} />
          <EditStudentButton student={student} onSaved={async()=>{ const s = await getStudent(student._id); setStudent(s); setNotice('Student saved successfully.'); setTimeout(()=>setNotice(null), 3000); }} />
          <Link to="/admin/students" className="rounded-xl border px-3 py-2 hover:bg-slate-50">Back</Link>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" value={student.name} />
          <Field label="Class Type" value={student.program} />
          <Field label="Group" value={groupNames} />
          <Field label="Monthly Fee" value={`$${student.monthlyFee ?? 0}`} />
          <Field label="Status" value={student.active ? 'Active' : 'Inactive'} />
          <Field label="Default Weekly Slot" value={displaySlot} />
          <Field label="Email" value={student.portalUser?.email || "-"} />
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

function AddSiblingButton({ baseStudent, onAdded }:{ baseStudent: Student; onAdded: (newId: string)=>void }){
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={()=>setOpen(true)}>Add Sibling</Button>
      {open && <AddSiblingModal baseStudent={baseStudent} onClose={()=>setOpen(false)} onSaved={(id)=>{ setOpen(false); onAdded(id); }} />}
    </>
  );
}

function AddSiblingModal({ baseStudent, onClose, onSaved }:{ baseStudent: Student; onClose: ()=>void; onSaved: (id: string)=>void }){
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [program, setProgram] = useState<Student["program"]>("One-on-one");
  const [monthlyFee, setMonthlyFee] = useState<number | undefined>(baseStudent.monthlyFee ?? undefined);
  const [weekday, setWeekday] = useState<number | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function submit(e: React.FormEvent){
    e.preventDefault(); setErr(null); setSaving(true);
    try {
      const payload: any = {
        name,
        program,
        address: address || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
        parentName: parentName || undefined,
        parentPhone: parentPhone || undefined,
      };
      if (typeof monthlyFee === 'number') payload.monthlyFee = monthlyFee;
      if (typeof weekday === 'number' && time) payload.defaultSlot = { weekday, time };
      const s = await createSibling(baseStudent._id, payload);
      onSaved(s._id);
    } catch(e:any){ setErr(e?.response?.data?.error || 'Could not create sibling'); setSaving(false); }
  }

  return (
    <Modal title="Add Sibling" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="text-sm text-slate-600">This student will share the same portal account as <span className="font-medium">{baseStudent.name}</span>.</div>
        <input className="w-full rounded-xl border px-3 py-2" placeholder="Student name" value={name} onChange={e=>setName(e.target.value)} required />
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
        <div className="grid grid-cols-2 gap-2">
          <select className="rounded-xl border px-3 py-2" value={program} onChange={e=>setProgram(e.target.value as any)}>
            <option>One-on-one</option>
            <option>Group</option>
          </select>
          <div />
        </div>
        <input className="w-full rounded-xl border px-3 py-2" type="number" placeholder="Monthly fee" value={monthlyFee ?? ''} onChange={e=>setMonthlyFee(e.target.value === '' ? undefined : Number(e.target.value))} />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm block">
            <div className="text-slate-600">Default Weekday (optional)</div>
            <select className="w-full rounded-xl border px-3 py-2" value={weekday ?? ''} onChange={e=>setWeekday(e.target.value === '' ? undefined : Number(e.target.value))}>
              <option value="">None</option>
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </label>
          <label className="text-sm block">
            <div className="text-slate-600">Default Time (HH:mm)</div>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="15:30" value={time} onChange={e=>setTime(e.target.value)} />
          </label>
        </div>
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button disabled={saving}>{saving ? 'Adding…' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
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
  const [program, setProgram] = useState<Student["program"]>(student.program);
  const { data: groups } = useGroups();
  const preselectedGroupId = useMemo(() => {
    const g = groups.find(g => g.memberIds.includes(student._id));
    return g?._id || "";
  }, [groups, student._id]);
  const [groupId, setGroupId] = useState<string>(preselectedGroupId);
  useEffect(() => {
    // Keep selection in sync if groups load later
    if (!groupId && preselectedGroupId) setGroupId(preselectedGroupId);
  }, [preselectedGroupId]);
  const [monthlyFee, setMonthlyFee] = useState<number>(student.monthlyFee ?? 0);
  const [active, setActive] = useState<boolean>(student.active);
  // weekly slot
  const existing: any = (student as any).defaultSlot || {};
  const [weekday, setWeekday] = useState<number>(typeof existing.weekday === 'number' ? existing.weekday : 2);
  const [time, setTime] = useState<string>(typeof existing.time === 'string' ? existing.time : '17:00');
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
        program,
        monthlyFee,
        active,
        defaultSlot: { weekday, time },
      } as any);
      if (program === 'Group' && groupId) {
        await addGroupMembers(groupId, [student._id]);
      }
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

        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            <div className="text-slate-600">Program</div>
            <select className="w-full rounded-xl border px-3 py-2" value={program} onChange={e=>setProgram(e.target.value as any)}>
              <option>One-on-one</option>
              <option>Group</option>
            </select>
          </label>
          {program === 'Group' ? (
            <label className="text-sm">
              <div className="text-slate-600">Group</div>
              <select className="w-full rounded-xl border px-3 py-2" value={groupId} onChange={e=>setGroupId(e.target.value)}>
                <option value="">Select group</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
              <div className="mt-1 text-xs text-slate-500">Use Groups page to remove from previous group(s).</div>
            </label>
          ) : <div />}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            <div className="text-slate-600">Monthly fee</div>
            <input className="w-full rounded-xl border px-3 py-2" type="number" value={monthlyFee} onChange={e=>setMonthlyFee(Number(e.target.value))} />
          </label>
          <label className="text-sm flex items-end gap-2">
            <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} />
            <span>Active</span>
          </label>
        </div>

        <div className="rounded-xl border bg-slate-50 p-3">
          <div className="mb-2 text-sm font-medium text-slate-700">Default weekly slot</div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">
              <div className="text-slate-600">Weekday</div>
              <select className="w-full rounded-xl border px-3 py-2" value={weekday} onChange={e=>setWeekday(Number(e.target.value))}>
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </label>
            <label className="text-sm">
              <div className="text-slate-600">Start time</div>
              <input type="time" className="w-full rounded-xl border px-3 py-2" value={time} onChange={e=>setTime(e.target.value)} />
            </label>
          </div>
          <div className="mt-1 text-xs text-slate-500">Used by "Generate Month" to create 4 lessons automatically.</div>
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
  const [showPast, setShowPast] = useState(false);

  const current = items.filter(i => i.status !== 'Completed');
  const past = items.filter(i => i.status === 'Completed');
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">Homework</div>
        <Button onClick={()=>setOpenAdd(true)}>Add Homework</Button>
      </div>
      {loading ? <div className="text-slate-500">Loading.</div>
        : error ? <div className="text-rose-600">{error}</div>
        : (
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-700">Current</div>
              {current.length === 0 ? (
                <div className="text-slate-500">No current homework.</div>
              ) : (
                <ul className="space-y-2">
                  {current.map(h => (
                    <li key={h._id} className="relative rounded-xl border bg-amber-50 p-3 shadow-sm">
                      <div className="absolute -left-1 top-3 h-2 w-2 rounded-full bg-amber-400"></div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm">
                          <div className="font-medium">{h.text}</div>
                          <div className="text-xs text-slate-500">Assigned on {new Date(h.createdAt).toLocaleDateString()}</div>
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
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">Past</div>
                <button className="text-sm text-slate-600 underline" onClick={()=>setShowPast(v=>!v)}>
                  {showPast ? 'Hide' : 'Show'} past ({past.length})
                </button>
              </div>
              {showPast && (
                past.length === 0 ? (
                  <div className="text-slate-500">No past homework.</div>
                ) : (
                  <ul className="space-y-2">
                    {past.map(h => (
                      <li key={h._id} className="relative rounded-xl border bg-slate-50 p-3">
                        <div className="absolute -left-1 top-3 h-2 w-2 rounded-full bg-slate-300"></div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm">
                            <div className="font-medium">{h.text}</div>
                            <div className="text-xs text-slate-500">Assigned on {new Date(h.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Completed</span>
                            <Button variant="secondary" size="sm" onClick={()=>setEditItem(h)}>Edit</Button>
                            <Button variant="danger" size="sm" onClick={async()=>{
                              if (!confirm('Delete this homework?')) return;
                              await deleteHomework(h._id);
                              await refresh();
                            }}>Delete</Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
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
