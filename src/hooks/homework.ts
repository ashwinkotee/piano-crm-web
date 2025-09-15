import { useEffect, useState } from "react";
import { api } from "../lib/api";

export type Homework = {
  _id: string;
  studentId: string;
  text: string;
  status: "Assigned" | "Completed";
  createdAt: string;
  updatedAt: string;
};

export function useStudentHomework(studentId: string) {
  const [items, setItems] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(`/students/${studentId}/homework`);
      setItems(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load homework");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (studentId) { refresh(); }
    function onWake(){ if (studentId) refresh(); }
    window.addEventListener('pianocrm:refresh', onWake);
    return () => { window.removeEventListener('pianocrm:refresh', onWake); };
  }, [studentId]);
  return { items, loading, error, refresh, setItems };
}

export async function addHomework(studentId: string, text: string) {
  const r = await api.post(`/students/${studentId}/homework`, { text });
  return r.data as Homework;
}

export async function updateHomework(id: string, patch: Partial<Pick<Homework, "text" | "status">>) {
  const r = await api.put(`/homework/${id}`, patch);
  return r.data as Homework;
}

export async function deleteHomework(id: string) {
  const r = await api.delete(`/homework/${id}`);
  return r.data as { ok: true };
}

export function useMyHomework() {
  const [items, setItems] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(`/homework/mine`);
      setItems(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load homework");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
    function onWake(){ refresh(); }
    window.addEventListener('pianocrm:refresh', onWake);
    return () => { window.removeEventListener('pianocrm:refresh', onWake); };
  }, []);
  return { items, loading, error, refresh, setItems };
}
