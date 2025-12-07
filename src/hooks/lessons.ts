import { useEffect, useState } from "react";
import { api, unwrapData } from "../lib/api";

export type Lesson = {
  _id: string;
  type: "one" | "group" | "demo";
  studentId?: string; // optional for demo
  groupId?: string;
  demoName?: string;  // for demo lessons
  start: string; // ISO
  end: string;   // ISO
  status: "Scheduled" | "Cancelled" | "Completed";
  notes?: string;
};

export function useLessons(params: { view: "week"|"month"; startISO: string; studentId?: string }) {
  const [data, setData] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  async function refresh() {
    if (!hydrated) setLoading(true);
    setError(null);
    try {
      const r = await api.get("/lessons", { params: { view: params.view, start: params.startISO, studentId: params.studentId } });
      setData(unwrapData<Lesson[]>(r) || []);
      setHydrated(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await refresh(); })();
    function onWake(){ refresh(); }
    window.addEventListener('pianocrm:refresh', onWake);
    return () => { mounted = false; window.removeEventListener('pianocrm:refresh', onWake); };
  }, [params.view, params.startISO, params.studentId]);
  return { data, loading: loading && !hydrated, error, refresh };
}

export async function generateMonth(payload: { year: number; month: number; durationMinutes?: number; includeFifth?: boolean }) {
  const r = await api.post("/lessons/generate-month", payload);
  return unwrapData<{ ok: boolean; created: number }>(r);
}

export async function updateLesson(id: string, patch: Partial<Pick<Lesson, "start"|"end"|"status"|"notes">>) {
  const r = await api.put(`/lessons/${id}`, patch);
  return unwrapData<Lesson>(r);
}

export async function deleteLesson(id: string) {
  const r = await api.delete(`/lessons/${id}`);
  return unwrapData<{ ok: boolean }>(r);
}

export async function createLesson(payload: (
  {
    studentId: string;
    type: "one" | "group";
    start: string; // ISO
    end: string;   // ISO
    notes?: string;
  } |
  {
    type: "demo";
    demoName: string;
    start: string; // ISO
    end: string;   // ISO
    notes?: string;
  }
)) {
  const r = await api.post("/lessons", payload);
  return unwrapData<Lesson>(r);
}
