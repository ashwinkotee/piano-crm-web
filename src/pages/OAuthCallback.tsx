import { useEffect } from "react";
import { api, unwrapData } from "../lib/api";
import { useAuth } from "../store/auth";

export default function OAuthCallback() {
  const { setAuth } = useAuth();
  useEffect(() => {
    (async () => {
      const r = await api.post("/auth/refresh", {}); // refresh cookie -> access token
      const token = unwrapData<{ accessToken: string }>(r)?.accessToken;
      const me = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const user = unwrapData<any>(me);
      setAuth(token!, user);
      window.location.href = user.role === "admin" ? "/admin" : "/portal";
    })();
  }, []);
  return <div className="p-6">Signing you in…</div>;
}
