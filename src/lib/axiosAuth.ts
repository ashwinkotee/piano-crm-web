import { api } from "./api";
import { useAuth, revalidateAuth } from "../store/auth";

export function installAxiosAuth() {
  api.interceptors.request.use((config) => {
    const token = useAuth.getState().token;
    if (token) {
      const headers: any = config.headers ?? {};
      headers["Authorization"] = `Bearer ${token}`;
      config.headers = headers;
    }
    return config;
  });

  // 401 handling: try refresh once, then retry the original request.
  let refreshing: Promise<void> | null = null;
  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const status = error?.response?.status;
      const original: any = error?.config || {};
      if (status === 401 && !original._retry) {
        try {
          original._retry = true;
          if (!refreshing) refreshing = revalidateAuth();
          await refreshing;
          refreshing = null;
          const token = useAuth.getState().token;
          if (!token) throw new Error("No token after refresh");
          original.headers = original.headers || {};
          original.headers["Authorization"] = `Bearer ${token}`;
          return api.request(original);
        } catch (e) {
          refreshing = null;
          await useAuth.getState().logout();
          return Promise.reject(e);
        }
      }
      return Promise.reject(error);
    }
  );
}
