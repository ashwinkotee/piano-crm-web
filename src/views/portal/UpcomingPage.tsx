import { useMemo, useState } from "react";
import { useLessons } from "../../hooks/lessons";
import { addMonths, format, parse, startOfMonth } from "date-fns";
import { useMyHomework, updateHomework } from "../../hooks/homework";

export default function UpcomingPage() {
  const [cursor, setCursor] = useState<Date>(startOfMonth(new Date()));
  const startISO = useMemo(() => format(cursor, "yyyy-MM-dd"), [cursor]);
  const { data, loading } = useLessons({ view: "month", startISO });
  const { items: homework, loading: hwLoading, refresh: refreshHW } = useMyHomework();
  const [showPastHW, setShowPastHW] = useState(false);

  const currentHomework = useMemo(() => homework.filter(h => h.status !== 'Completed'), [homework]);
  const pastHomework = useMemo(() => homework.filter(h => h.status === 'Completed'), [homework]);

  const grouped = useMemo(() => {
    return data.reduce((acc: Record<string, typeof data>, l) => {
      const key = format(new Date(l.start), "yyyy-MM-dd");
      (acc[key] ||= []).push(l);
      return acc;
    }, {});
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">Homework</div>
        </div>
        {hwLoading ? (
          <div className="text-slate-500">Loading.</div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-700">Current</div>
              {currentHomework.length === 0 ? (
                <div className="text-slate-500">No current homework.</div>
              ) : (
                <ul className="space-y-2">
                  {currentHomework.map(h => (
                    <li key={h._id} className="relative rounded-xl border bg-amber-50 p-3 shadow-sm">
                      <div className="absolute -left-1 top-3 h-2 w-2 rounded-full bg-amber-400"></div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm">
                          <div className="font-medium">{h.text}</div>
                          <div className="text-xs text-slate-500">Assigned on {new Date(h.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${h.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{h.status}</span>
                          <button className="rounded-xl border bg-white px-3 py-1.5 hover:bg-slate-50" onClick={async()=>{ await updateHomework(h._id, { status: 'Completed' }); await refreshHW(); }}>Mark Completed</button>
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
                <button className="text-sm text-slate-600 underline" onClick={()=>setShowPastHW(v=>!v)}>
                  {showPastHW ? 'Hide' : 'Show'} past ({pastHomework.length})
                </button>
              </div>
              {showPastHW && (
                pastHomework.length === 0 ? (
                  <div className="text-slate-500">No past homework.</div>
                ) : (
                  <ul className="space-y-2">
                    {pastHomework.map(h => (
                      <li key={h._id} className="relative rounded-xl border bg-slate-50 p-3">
                        <div className="absolute -left-1 top-3 h-2 w-2 rounded-full bg-slate-300"></div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm">
                            <div className="font-medium">{h.text}</div>
                            <div className="text-xs text-slate-500">Assigned on {new Date(h.createdAt).toLocaleDateString()}</div>
                          </div>
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Completed</span>
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">{format(cursor, "MMMM yyyy")}</div>
          <div className="text-sm text-slate-500">
            Your teacher manages scheduling. Contact them for any changes.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl border px-3 py-2 hover:bg-slate-50" onClick={() => setCursor(addMonths(cursor, -1))}>
            ← Prev
          </button>
          <button className="rounded-xl border px-3 py-2 hover:bg-slate-50" onClick={() => setCursor(addMonths(cursor, 1))}>
            Next →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-4 shadow-sm text-slate-500">Loading…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl border bg-white p-4 shadow-sm text-slate-500">No scheduled lessons.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(grouped).map(([date, lessons]) => (
            <div key={date} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold">{format(parse(date, "yyyy-MM-dd", new Date()), "EEEE, MMM d")}</div>
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {lessons.length} lesson{lessons.length > 1 ? "s" : ""}
                </span>
              </div>
              <ul className="divide-y divide-slate-200">
                {lessons.map(l => (
                  <li key={l._id} className="flex flex-col items-start justify-between gap-2 py-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-28 text-sm text-slate-500">
                        {format(new Date(l.start), "p")} – {format(new Date(l.end), "p")}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{l.type === "one" ? "One-on-one" : "Group"}</div>
                        {l.notes && <div className="text-slate-500">{l.notes}</div>}
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      l.status === "Scheduled" ? "bg-emerald-100 text-emerald-700"
                        : l.status === "Cancelled" ? "bg-rose-100 text-rose-600"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {l.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
