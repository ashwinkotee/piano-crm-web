import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import type { Student } from "../../hooks/students";
import { useStudents, createStudent } from "../../hooks/students";
import { useGroups } from "../../hooks/groups";

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const;

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const { data, loading, refresh } = useStudents({ q: search });

  const all = useMemo(() => [...data].sort((a,b) => a.name.localeCompare(b.name)), [data]);
  const active = useMemo(() => all.filter(s => s.active), [all]);
  const inactive = useMemo(() => all.filter(s => !s.active), [all]);
  const [showInactive, setShowInactive] = useState(false);

  const [adding, setAdding] = useState(false);
  const [invite, setInvite] = useState<{ email: string; tempPassword: string } | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Students</div>
          <div className="text-sm text-slate-500">Active students on top; inactive are tucked below.</div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name."
            className="w-full rounded-xl border px-3 py-2 sm:w-60"
          />
          <Button onClick={() => setAdding(true)}>Add Student</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading.</div>
      ) : (
        <div className="rounded-2xl border bg-white p-4 shadow-sm overflow-x-auto">
          <div className="mb-2 font-semibold">Active Students</div>
          <div className="mb-3 text-xs text-slate-500">Hint: Click a student’s name to view/edit.</div>
          <StudentTable items={active} />

          <div className="mt-6 flex items-center justify-between">
            <div className="font-semibold">Inactive Students</div>
            <button
              type="button"
              onClick={() => setShowInactive(v => !v)}
              className="flex items-center gap-1 rounded-lg border px-3 py-1 text-sm hover:bg-slate-50"
            >
              <span>{showInactive ? "Hide" : "Show"}</span>
              <svg className={`h-4 w-4 transition-transform ${showInactive ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.188l3.71-3.958a.75.75 0 0 1 1.08 1.04l-4.24 4.52a.75.75 0 0 1-1.08 0l-4.24-4.52a.75.75 0 0 1 .02-1.06Z" />
              </svg>
            </button>
          </div>
          {showInactive && (
            <div className="mt-3">
              <StudentTable items={inactive} emptyLabel="No inactive students" />
            </div>
          )}
        </div>
      )}

      {adding && (
        <AddStudentModal
          onClose={() => setAdding(false)}
          onCreated={async (res) => {
            setAdding(false);
            await refresh();
            if (res.tempPassword) setInvite({ email: res.portalUser.email, tempPassword: res.tempPassword });
          }}
        />
      )}
      {invite && (
        <TempPasswordDialog info={invite} onClose={() => setInvite(null)} />
      )}
    </div>
  );
}

function StudentTable({ items, emptyLabel = "No students" }:{ items: Student[]; emptyLabel?: string }) {
  const { data: groups } = useGroups();
  const groupByStudent: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const g of groups) {
      for (const sid of g.memberIds) {
        (map[sid] ||= []).push(g.name);
      }
    }
    return map;
  }, [groups]);
  return (
      <table className="w-full min-w-[760px] text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="p-2 whitespace-nowrap">Name</th>
            <th className="p-2 whitespace-nowrap">Program</th>
            <th className="p-2 whitespace-nowrap">Group</th>
            <th className="p-2 whitespace-nowrap">Weekly slot</th>
            <th className="p-2 whitespace-nowrap">Fee</th>
            <th className="p-2 whitespace-nowrap">Status</th>
            
          </tr>
        </thead>
        <tbody>
          {items.map(s => {
            const slot: any = (s as any).defaultSlot;
            const displaySlot = slot && typeof slot.weekday === "number" && slot.time
              ? `${WEEKDAYS[slot.weekday]} - ${slot.time}`
              : "-";
            const groupsFor = (groupByStudent[s._id] || []).join(', ') || '-';
            return (
              <tr key={s._id} className="border-t">
                <td className="p-2 font-medium text-indigo-700 underline decoration-indigo-200 underline-offset-2">
                  <Link to={`/admin/students/${s._id}`}>{s.name}</Link>
                </td>
                <td className="p-2">{s.program}</td>
                <td className="p-2">{groupsFor}</td>
                <td className="p-2 text-slate-600">{displaySlot}</td>
                <td className="p-2">${s.monthlyFee ?? 0}</td>
                <td className="p-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold
                    ${s.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>
                
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr><td colSpan={6} className="p-3 text-slate-500">{emptyLabel}</td></tr>
          )}
        </tbody>
      </table>
  );
}

function AddStudentModal({
  onClose,
  onCreated
}:{ onClose: ()=>void; onCreated: (res: Awaited<ReturnType<typeof createStudent>>) => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [email, setEmail] = useState("");
  const [program, setProgram] = useState<"One-on-one"|"Group">("One-on-one");
  const [monthlyFee, setMonthlyFee] = useState<number>(200);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Group membership is managed from the Groups page

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setSaving(true);
    try {
      const payload = {
        name,
        address: address || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
        parentName: parentName || undefined,
        parentPhone: parentPhone || undefined,
        email,
        program,
        monthlyFee,
      };
      const res = await createStudent(payload);
      onCreated(res);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Could not create student");
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} title="Add Student">
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded-xl border px-3 py-2" placeholder="Student name" value={name} onChange={e=>setName(e.target.value)} />
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
        <input className="w-full rounded-xl border px-3 py-2" placeholder="Portal email (parent/student)" value={email} onChange={e=>setEmail(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <select className="rounded-xl border px-3 py-2" value={program} onChange={e=>setProgram(e.target.value as any)}>
            <option>One-on-one</option>
            <option>Group</option>
          </select>
          <div />
        </div>
        <input className="w-full rounded-xl border px-3 py-2" type="number" placeholder="Monthly fee" value={monthlyFee} onChange={e=>setMonthlyFee(Number(e.target.value))} />
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border px-3 py-2 hover:bg-slate-50">Cancel</button>
          <button disabled={saving} className="rounded-xl bg-indigo-600 text-white px-3 py-2">{saving ? "Saving." : "Create"}</button>
        </div>
      </form>
      <p className="mt-2 text-xs text-slate-500">A portal account is created automatically for this email with a temporary password.</p>
    </Modal>
  );
}

// (EditStudentModal was removed; all editing happens on StudentDetailPage)

function TempPasswordDialog({ info, onClose }:{
  info: { email: string; tempPassword: string }; onClose: ()=>void;
}) {
  return (
    <Modal onClose={onClose} title="Portal account created">
      <div className="space-y-2">
        <div>Account email: <span className="font-medium">{info.email}</span></div>
        <div>Temporary password: <code className="rounded bg-slate-100 px-2 py-1">{info.tempPassword}</code></div>
        <p className="text-xs text-slate-500">Share this with the parent/student. They can sign in and change password afterwards.</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-indigo-600 text-white px-3 py-2">Done</button>
        </div>
      </div>
    </Modal>
  );
}
