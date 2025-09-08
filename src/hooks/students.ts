import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export type Student = {
  _id: string;
  name: string;
  address?: string;
  dateOfBirth?: string; // ISO
  parentName?: string;
  parentPhone?: string;
  program: "One-on-one" | "Group";
  ageGroup?: "6-9" | "10-14" | "15+";
  monthlyFee?: number;
  active: boolean;
  portalUserId?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
};

export function useStudents(params?: {
  program?: Student["program"];
  ageGroup?: NonNullable<Student["ageGroup"]>;
  active?: boolean;
  q?: string;
}) {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const query = useMemo(() => {
    const q: any = {};
    if (params?.program) q.program = params.program;
    if (params?.ageGroup) q.ageGroup = params.ageGroup;
    if (typeof params?.active === "boolean") q.active = String(params.active);
    if (params?.q) q.q = params.q;
    return q;
  }, [params]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const r = await api.get("/students", { params: query });
      if (mounted) setData(r.data);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [JSON.stringify(query)]);

  return { data, loading, refresh: async () => {
    const r = await api.get("/students", { params: query });
    setData(r.data);
  }};
}

export async function createStudent(payload: {
  name: string;
  address?: string;
  dateOfBirth?: string; // ISO date (YYYY-MM-DD)
  parentName?: string;
  parentPhone?: string;
  email: string; // portal account email
  program: Student["program"];
  ageGroup?: NonNullable<Student["ageGroup"]>;
  monthlyFee?: number;
}) {
  const r = await api.post("/students", payload);
  const d = r.data as any;
  const student: Student = {
    _id: String(d._id ?? d.student?._id),
    name: d.name ?? d.student?.name,
    address: d.address ?? d.student?.address,
    dateOfBirth: d.dateOfBirth ?? d.student?.dateOfBirth,
    parentName: d.parentName ?? d.student?.parentName,
    parentPhone: d.parentPhone ?? d.student?.parentPhone,
    program: d.program ?? d.student?.program,
    ageGroup: d.ageGroup ?? d.student?.ageGroup,
    monthlyFee: d.monthlyFee ?? d.student?.monthlyFee,
    active: Boolean(d.active ?? d.student?.active ?? true),
  };
  const portalUser = { id: String(d.portalUser?._id ?? d.portalUser?.id ?? d.userId ?? ""), email: d.portalUser?.email };
  return { student, portalUser, tempPassword: d.tempPassword };
}

export async function updateStudent(id: string, patch: Partial<Student>) {
  const r = await api.put(`/students/${id}`, patch);
  return r.data as Student;
}

export async function getStudent(id: string) {
  const r = await api.get(`/students/${id}`);
  return r.data as Student;
}

export async function getMyStudents() {
  const r = await api.get(`/students/me/list`);
  return r.data as Student[];
}

export async function acceptMyTerms() {
  const r = await api.post(`/students/me/accept-terms`, {});
  return r.data as { updated: number; at: string };
}

export async function createSibling(baseStudentId: string, payload: {
  name: string;
  address?: string;
  dateOfBirth?: string; // ISO date (YYYY-MM-DD)
  parentName?: string;
  parentPhone?: string;
  program: Student["program"];
  ageGroup?: NonNullable<Student["ageGroup"]>;
  monthlyFee?: number;
  defaultSlot?: { weekday: number; time: string };
}) {
  const r = await api.post(`/students/${baseStudentId}/siblings`, payload);
  return r.data as Student;
}
