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
