import { api } from "../lib/api";
import { useEffect, useState } from "react";

export type Group = {
  _id: string;
  name: string;
  description?: string;
  memberIds: string[];
  active: boolean;
};

export type GroupMeta = {
  createdLessons: number;
  removedLessons: number;
  addedMembers: number;
  removedMembers: number;
};

export function useGroups() {
  const [data, setData] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function refresh() {
    if (!hydrated) setLoading(true);
    setError(null);
    try {
      const r = await api.get("/groups");
      setData(r.data);
      setHydrated(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load groups");
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
  }, []);
  return { data, loading: loading && !hydrated, error, refresh };
}

export async function createGroup(payload: { name: string; description?: string; memberIds: string[] }) {
  const r = await api.post("/groups", payload);
  return r.data as { group: Group; meta: GroupMeta };
}

export async function updateGroup(id: string, payload: { name: string; description?: string; memberIds: string[] }) {
  const r = await api.put(`/groups/${id}`, payload);
  return r.data as { group: Group; meta: GroupMeta };
}

export async function addGroupMembers(id: string, memberIds: string[]) {
  const r = await api.post(`/groups/${id}/add-members`, { memberIds });
  return r.data as { group: Group; meta: GroupMeta };
}

export async function scheduleGroupSessions(id: string, payload: { dates: string[]; durationMinutes: number; notes?: string }) {
  const r = await api.post(`/groups/${id}/schedule`, payload);
  return r.data as { ok: true; created: number };
}

export async function deleteGroup(id: string) {
  const r = await api.delete(`/groups/${id}`);
  return r.data as { ok: true };
}
