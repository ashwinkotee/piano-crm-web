import { api } from "./api";
import { useAuth } from "../store/auth";

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

  // Basic 401 handling: if token is invalid/expired, logout.
  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error?.response?.status === 401) {
        useAuth.getState().logout();
      }
      return Promise.reject(error);
    }
  );
}
