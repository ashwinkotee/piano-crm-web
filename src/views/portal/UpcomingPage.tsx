import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { addMonths, format, parse, startOfMonth } from "date-fns";
import { useLessons } from "../../hooks/lessons";
import { useMyHomework, updateHomework } from "../../hooks/homework";
import { getMyStudents, type Student } from "../../hooks/students";

export default function UpcomingPage() {
  const [cursor, setCursor] = useState<Date>(startOfMonth(new Date()));
  const startISO = useMemo(() => format(cursor, "yyyy-MM-dd"), [cursor]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { items: homeworkAll, loading: hwLoading, refresh: refreshHW } = useMyHomework();
  const [showPastHW, setShowPastHW] = useState(false);

  useEffect(() => { (async () => {
    const s = await getMyStudents();
    setStudents(s);
    if (!selectedId && s.length) setSelectedId(s[0]._id);
  })(); }, []);

  const { data: lessons, loading } = useLessons({ view: "month", startISO, studentId: selectedId || undefined });

  const currentHomework = useMemo(() => homeworkAll.filter(h => (!selectedId || h.studentId === selectedId) && h.status !== 'Completed'), [homeworkAll, selectedId]);
  const pastHomework = useMemo(() => homeworkAll.filter(h => (!selectedId || h.studentId === selectedId) && h.status === 'Completed'), [homeworkAll, selectedId]);

  const grouped = useMemo(() => {
    return lessons.reduce((acc: Record<string, typeof lessons>, l) => {
      const key = format(new Date(l.start), "yyyy-MM-dd");
      (acc[key] ||= []).push(l);
      return acc;
    }, {} as Record<string, typeof lessons>);
  }, [lessons]);

  return (
    <div className="space-y-6">
      {/* Terms disclaimer */}
      {students.length > 0 && students.some(s => !s.termsAccepted) && (
        <div className="rounded-xl border border-amber-300/30 bg-amber-50/80 p-3 text-amber-900">
          <div className="text-sm">
            Please review and accept the Terms and Conditions to continue using the portal. {" "}
            <NavLink to="/portal/terms" className="underline font-medium">Review Terms</NavLink>
          </div>
        </div>
      )}
      {/* Student Tabs */}
      {students.length > 1 && (
        <div className="mb-2">
          <div role="tablist" className="flex w-full items-center gap-2 overflow-x-auto rounded-xl bg-white/10 p-1">
            {students.map((s) => {
              const active = selectedId === s._id;
              return (
                <button
                  key={s._id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedId(s._id)}
                  className={`focus-ring cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-all ${
                    active ? 'bg-white/20 text-white shadow-sm' : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {students.length === 0 && (
        <div className="glass rounded-2xl p-4 text-sm text-slate-200">No students linked to your account.</div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Homework */}
        <div className="lg:col-span-5">
          <div className="glass rounded-2xl p-4 shadow-sm animate-fade-up">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-lg font-semibold section-title">Homework {selectedId ? `• ${(students.find(s=>s._id===selectedId)?.name) || ''}` : ''}</div>
            </div>
            {hwLoading ? (
              <div className="text-slate-300">Loading.</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-200">Current</div>
                  {currentHomework.length === 0 ? (
                    <div className="text-slate-300">No current homework.</div>
                  ) : (
                    <ul className="space-y-2">
                      {currentHomework.map(h => (
                        <li key={h._id} className="relative rounded-xl border border-white/15 bg-white/10 p-3 shadow-sm">
                          <div className="absolute -left-1 top-3 h-2 w-2 rounded-full bg-amber-400" />
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm">
                              <div className="font-medium text-white">{h.text}</div>
                              <div className="text-xs text-slate-300">Assigned on {new Date(h.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`portal-badge ${h.status === 'Completed' ? 'portal-badge-ok' : 'portal-badge-warn'}`}>{h.status}</span>
                              <button className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-slate-100 hover:bg-white/20" onClick={async()=>{ await updateHomework(h._id, { status: 'Completed' }); await refreshHW(); }}>Mark Completed</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-200">Past</div>
                    <button className="text-sm text-slate-300 underline" onClick={()=>setShowPastHW(v=>!v)}>
                      {showPastHW ? 'Hide' : 'Show'} past ({pastHomework.length})
                    </button>
                  </div>
                  {showPastHW && (
                    pastHomework.length === 0 ? (
                      <div className="text-slate-300">No past homework.</div>
                    ) : (
                      <ul className="space-y-2">
                        {pastHomework.map(h => (
                          <li key={h._id} className="relative rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="absolute -left-1 top-3 h-2 w-2 rounded-full bg-slate-300" />
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="text-sm">
                                <div className="font-medium text-white">{h.text}</div>
                                <div className="text-xs text-slate-300">Assigned on {new Date(h.createdAt).toLocaleDateString()}</div>
                              </div>
                              <span className="portal-badge portal-badge-ok">Completed</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xl font-semibold section-title">{format(cursor, "MMMM yyyy")}</div>
              <div className="text-sm text-slate-300">Your teacher manages scheduling. Contact them for any changes.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-slate-100 hover:bg-white/20" onClick={() => setCursor(addMonths(cursor, -1))}>Prev</button>
              <button className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-slate-100 hover:bg-white/20" onClick={() => setCursor(addMonths(cursor, 1))}>Next</button>
            </div>
          </div>

          {loading ? (
            <div className="glass rounded-2xl p-4 text-slate-200">Loading.</div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="glass rounded-2xl p-4 text-slate-200">No scheduled lessons.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(grouped).map(([date, list]) => (
                <div key={date} className="glass rounded-2xl p-4 shadow-sm animate-fade-up">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-semibold">{format(parse(date, "yyyy-MM-dd", new Date()), "EEEE, MMM d")}</div>
                    <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">{list.length} lesson{list.length > 1 ? 's' : ''}</span>
                  </div>
                  <ul className="divide-y divide-white/10">
                    {list.map(l => (
                      <li key={l._id} className="flex flex-col items-start justify-between gap-2 py-2 sm:flex-row sm:items-center transition-all hover:-translate-y-0.5">
                        <div className="flex items-center gap-3">
                          <div className="w-28 text-sm text-slate-300">{format(new Date(l.start), "p")} - {format(new Date(l.end), "p")}</div>
                          <div className="text-sm">
                            <div className="font-medium">{l.type === 'one' ? 'One-on-one' : 'Group'}</div>
                            {students.length > 1 && selectedId && (
                              <div className="text-xs text-slate-300">{students.find(s=>s._id===selectedId)?.name}</div>
                            )}
                            {l.notes && <div className="text-slate-300">{l.notes}</div>}
                          </div>
                        </div>
                        <span className={`portal-badge ${
                          l.status === 'Scheduled' ? 'portal-badge-ok' :
                          l.status === 'Cancelled' ? 'portal-badge-danger' : 'portal-badge-muted'
                        }`}>{l.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

