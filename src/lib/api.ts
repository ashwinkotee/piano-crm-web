import axios from "axios";

function resolveBaseUrl() {
  const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (fromEnv && fromEnv !== "undefined") {
    return fromEnv.replace(/\/+$/, "");
  }
  const devFallback = typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : undefined;
  if (devFallback) return devFallback;
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/+$/, "");
  }
  console.error("VITE_API_URL is not configured; requests may fail.");
  return "";
}

export const API_BASE_URL = resolveBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Some backend endpoints now wrap payloads in { data, meta }. This helper
// extracts the useful data while remaining compatible with legacy shapes.
export function unwrapData<T>(response: any): T {
  const first = response && typeof response === "object" && "data" in response ? (response as any).data : response;
  if (first && typeof first === "object" && "data" in (first as any)) {
    return (first as any).data as T;
  }
  return first as T;
}
