import { useMemo, useState } from "react";
import { useLeads, createLead, updateLead, convertLead, scheduleLeadTrial, deleteLead, type Lead, type LeadStatus } from "../../hooks/leads";
import Button from "../../components/ui/Button";

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tz);
  return local.toISOString().slice(0, 16);
}

const STATUSES: LeadStatus[] = ["Contacted", "Trial", "Won", "Lost"];

export default function LeadsPage() {
  const [status, setStatus] = useState<LeadStatus | undefined>(undefined);
  const [q, setQ] = useState("");
  const { items, loading, error, refresh, setItems } = useLeads({ status, q });
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", guardianName: "", email: "", phone: "", age: "", location: "", notes: "" });

  const filtered = useMemo(() => items, [items]);

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const lead = await createLead({
        name: form.name.trim(),
        guardianName: form.guardianName.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        age: form.age.trim() || undefined,
        location: form.location.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setItems((prev) => [lead, ...prev]);
      setForm({ name: "", guardianName: "", email: "", phone: "", age: "", location: "", notes: "" });
    } finally {
      setCreating(false);
    }
  }

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  async function quickStatus(lead: Lead, next: LeadStatus) {
    const updated = await updateLead(lead._id, { status: next });
    setItems((prev) => prev.map((l) => (l._id === lead._id ? updated : l)));
  }

  async function setTrial(lead: Lead, iso: string) {
    // Normalize to ISO with timezone to satisfy API validation
    const normalized = (() => {
      if (!iso) return "";
      const candidate = iso.includes("T") ? iso : iso.replace(" ", "T");
      const d = new Date(candidate);
      return isNaN(d.getTime()) ? "" : d.toISOString();
    })();
    const res = await scheduleLeadTrial(lead._id, { start: normalized });
    setItems((prev) => prev.map((l) => (l._id === lead._id ? res.lead : l)));
  }

  async function markLost(lead: Lead, reason: string) {
    const updated = await updateLead(lead._id, { status: "Lost", outcome: reason || undefined });
    setItems((prev) => prev.map((l) => (l._id === lead._id ? updated : l)));
  }

  async function handleConvert(lead: Lead, payload: { email: string; program: "One-on-one" | "Group"; monthlyFee?: number; name?: string }) {
    const res = await convertLead(lead._id, payload);
    const updated = await updateLead(lead._id, { status: "Won" });
    const nextLead = { ...updated, studentId: res.studentId };
    setItems((prev) => prev.map((l) => (l._id === lead._id ? nextLead : l)));
    alert(`Portal created.\nEmail: ${payload.email}\nTemp password: ${res.tempPassword}`);
  }

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleDelete(lead: Lead) {
    if (!window.confirm(`Delete lead "${lead.name}"?`)) return;
    await deleteLead(lead._id);
    setItems((prev) => prev.filter((l) => l._id !== lead._id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-2xl font-semibold text-white">Leads</div>
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50"
          />
          <Button size="sm" variant="secondary" onClick={refresh}>Refresh</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label="All" active={!status} onClick={() => setStatus(undefined)} />
        {STATUSES.map((s) => (
          <FilterChip key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
        ))}
      </div>

      <form onSubmit={submitNew} className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="font-semibold text-white">New lead</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Parent/Guardian" value={form.guardianName} onChange={(v) => setForm({ ...form, guardianName: v })} />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={creating || !form.name.trim()}>{creating ? "Saving..." : "Save lead"}</Button>
          <Button type="button" variant="secondary" onClick={() => setForm({ name: "", guardianName: "", email: "", phone: "", age: "", location: "", notes: "" })}>Clear</Button>
        </div>
      </form>

      {error && <div className="text-sm text-rose-300">{error}</div>}

      <div className="grid gap-3">
        <div className="hidden items-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:grid md:grid-cols-[1.2fr,1fr,1fr,0.8fr,0.8fr,0.9fr,auto]">
          <span>Name</span>
          <span>Parent/Guardian</span>
          <span>Phone</span>
          <span>Age</span>
          <span>Demo</span>
          <span>Status</span>
          <span />
        </div>
        {loading && <div className="text-slate-300">Loading...</div>}
        {!loading && filtered.length === 0 && <div className="text-slate-400">No leads yet.</div>}
        {filtered.map((lead) => (
          <LeadRow
            key={lead._id}
            lead={lead}
            open={openIds.has(lead._id)}
            onToggle={() => toggle(lead._id)}
            onStatus={quickStatus}
            onTrial={setTrial}
            onLost={markLost}
            onConvert={handleConvert}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

function LeadRow({
  lead,
  open,
  onToggle,
  onStatus,
  onTrial,
  onLost,
  onConvert,
  onDelete,
}: {
  lead: Lead;
  open: boolean;
  onToggle: () => void;
  onStatus: (lead: Lead, next: LeadStatus) => void;
  onTrial: (lead: Lead, iso: string) => void;
  onLost: (lead: Lead, reason: string) => void;
  onConvert: (lead: Lead, payload: { email: string; program: "One-on-one" | "Group"; monthlyFee?: number; name?: string }) => void;
  onDelete: (lead: Lead) => void;
}) {
  const [trialAt, setTrialAt] = useState(() => toLocalInputValue(lead.trialAt));
  const [lostReason, setLostReason] = useState("");
  const [convertEmail, setConvertEmail] = useState(lead.email || "");
  const [convertName, setConvertName] = useState(lead.name || "");
  const [convertProgram, setConvertProgram] = useState<"One-on-one" | "Group">("One-on-one");
  const [convertFee, setConvertFee] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editingTrial, setEditingTrial] = useState(!lead.trialAt);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5">
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5">
        <div className="grid flex-1 grid-cols-1 gap-2 text-sm text-slate-200 md:grid-cols-[1.2fr,1fr,1fr,0.8fr,0.8fr,0.9fr] md:items-center">
          <div className="text-lg font-semibold text-white">{lead.name}</div>
          <span>{lead.guardianName || "-"}</span>
          <span>{lead.phone || "-"}</span>
          <span>{lead.age || "-"}</span>
          <span>{lead.trialAt ? new Date(lead.trialAt).toLocaleString() : "-"}</span>
          <span className="capitalize">{lead.status}</span>
        </div>
        <span className="text-white/70 text-xl">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="border-t border-white/10 p-4">
          <div className="grid gap-2 text-sm text-slate-200">
            {lead.email && <div>Email: {lead.email}</div>}
            {lead.location && <div>Location: {lead.location}</div>}
            {lead.notes && <div>Notes: {lead.notes}</div>}
            {err && <div className="text-rose-300">{err}</div>}
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-sm font-semibold text-white">Book trial</div>
              {!lead.trialAt || editingTrial ? (
                <>
                  <input
                    type="datetime-local"
                    value={trialAt}
                    onChange={(e) => setTrialAt(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                  />
                  <Button
                    className="mt-2 w-full"
                    size="sm"
                    variant="secondary"
                    disabled={!trialAt || busy}
                    onClick={async () => {
                      if (!trialAt) return;
                      setBusy(true);
                      setErr(null);
                      try { await onTrial(lead, trialAt); setEditingTrial(false); } catch (e: any) { setErr(e?.response?.data?.error || e?.message || "Unable to book"); } finally { setBusy(false); }
                    }}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
                  <span>{new Date(lead.trialAt).toLocaleString()}</span>
                  <button
                    className="text-indigo-200 hover:text-white"
                    onClick={() => { setEditingTrial(true); setTrialAt(toLocalInputValue(lead.trialAt)); }}
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-sm font-semibold text-white">Set status</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => onStatus(lead, "Contacted")}>Contacted</Button>
                <Button size="sm" variant="secondary" onClick={() => onStatus(lead, "Trial")}>Trial</Button>
                <Button size="sm" variant="secondary" onClick={() => onStatus(lead, "Won")}>Converted</Button>
                <Button size="sm" variant="secondary" onClick={() => onLost(lead, lostReason || "Lost")}>Lost</Button>
              </div>
              <textarea
                placeholder="Reason (optional)"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
              />
            </div>

            {!lead.studentId && (
              <div className="rounded-lg border border-white/10 p-3">
                <div className="text-sm font-semibold text-white">Convert to student</div>
                <input
                  placeholder="Student email"
                  value={convertEmail}
                  onChange={(e) => setConvertEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                />
                <input
                  placeholder="Name"
                  value={convertName}
                  onChange={(e) => setConvertName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                />
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-200">
                  <label className="flex items-center gap-1">
                    <input type="radio" checked={convertProgram === "One-on-one"} onChange={() => setConvertProgram("One-on-one")} /> One-on-one
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" checked={convertProgram === "Group"} onChange={() => setConvertProgram("Group")} /> Group
                  </label>
                </div>
                <input
                  placeholder="Monthly fee (optional)"
                  value={convertFee}
                  onChange={(e) => setConvertFee(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                />
                <Button
                  className="mt-2 w-full"
                  size="sm"
                  disabled={!convertEmail}
                  onClick={() => convertEmail && onConvert(lead, {
                    email: convertEmail,
                    name: convertName,
                    program: convertProgram,
                    monthlyFee: convertFee ? Number(convertFee) : undefined,
                  })}
                >
                  Convert
                </Button>
              </div>
            )}
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-sm font-semibold text-white">Delete lead</div>
              <p className="mt-1 text-xs text-slate-300">This removes the lead and any demo booking.</p>
              <Button
                className="mt-2 w-full"
                size="sm"
                variant="secondary"
                onClick={() => onDelete(lead)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm ${active ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-200 hover:bg-white/10"}`}
    >
      {label}
    </button>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm text-slate-200">
      <div className="mb-1 text-xs text-slate-400">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50"
      />
    </label>
  );
}
