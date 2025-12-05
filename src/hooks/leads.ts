import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export type LeadStatus = "Contacted" | "Trial" | "Won" | "Lost";

export type Lead = {
  _id: string;
  name: string;
  guardianName?: string;
  email?: string;
  phone?: string;
  age?: string;
  location?: string;
  status: LeadStatus;
  trialAt?: string;
  notes?: string;
  outcome?: string;
  studentId?: string;
  createdAt: string;
  updatedAt: string;
};

export function useLeads(params?: { status?: LeadStatus; q?: string }) {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const q: any = {};
    if (params?.status) q.status = params.status;
    if (params?.q) q.q = params.q;
    return q;
  }, [params?.status, params?.q]);

  async function refresh() {
    if (!hydrated) setLoading(true);
    setError(null);
    try {
      const r = await api.get("/leads", { params: query });
      setItems(r.data);
      setHydrated(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    function onWake(){ refresh(); }
    window.addEventListener('pianocrm:refresh', onWake);
    return () => { window.removeEventListener('pianocrm:refresh', onWake); };
  }, [JSON.stringify(query)]);

  return { items, loading: loading && !hydrated, error, refresh, setItems };
}

export async function createLead(payload: {
  name: string;
  guardianName?: string;
  email?: string;
  phone?: string;
  age?: string;
  location?: string;
  notes?: string;
}) {
  const r = await api.post("/leads", payload);
  return r.data as Lead;
}

export async function updateLead(id: string, payload: Partial<{
  name: string;
  guardianName: string;
  email: string;
  phone: string;
  age: string;
  location: string;
  notes: string;
  status: LeadStatus;
  trialAt: string | null;
  outcome: string;
}>) {
  const r = await api.put(`/leads/${id}`, payload);
  return r.data as Lead;
}

export async function scheduleLeadTrial(id: string, payload: { start: string; durationMinutes?: number }) {
  const r = await api.post(`/leads/${id}/trial`, payload);
  return r.data as { lead: Lead; lesson: any };
}

export async function deleteLead(id: string) {
  const r = await api.delete(`/leads/${id}`);
  return r.data as { ok: boolean };
}

export async function convertLead(id: string, payload: {
  email: string;
  program?: "One-on-one" | "Group";
  monthlyFee?: number;
  name?: string;
}) {
  const r = await api.post(`/leads/${id}/convert`, payload);
  return r.data as { leadId: string; studentId: string; tempPassword: string; portalUser: { _id: string; email: string } };
}
