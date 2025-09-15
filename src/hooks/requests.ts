import { api } from "../lib/api";
import { useEffect, useState } from "react";

export type RequestItem = {
  _id: string;
  lessonId: string;
  studentId: string;
  type: "reschedule" | "cancel";
  message?: string;
  proposedStart?: string; // ISO
  status: "Pending" | "Approved" | "Rejected";
  decisionNote?: string;
  createdAt: string;
};

export function useRequests() {
  const [data, setData] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/requests");
      setData(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load requests");
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
  return { data, loading, error, refresh };
}

// createRequest removed as unused; add back when portal requests form is implemented

export async function decideRequest(id: string, payload: { status: "Approved"|"Rejected"; decisionNote?: string; newStart?: string }) {
  const r = await api.patch(`/requests/${id}`, payload);
  return r.data as { ok: true };
}
