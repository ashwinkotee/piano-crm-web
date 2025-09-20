import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import OAuthCallback from "./pages/OAuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import { Protected } from "./components/Protected";
import { installAxiosAuth } from "./lib/axiosAuth";
import "./index.css";
import { revalidateAuth } from "./store/auth";
import ChangePassword from "./views/portal/ChangePassword";

const AdminApp = React.lazy(() => import("./scenes/AdminApp"));
const PortalApp = React.lazy(() => import("./scenes/PortalApp"));

installAxiosAuth();
async function bootstrap() {
  await revalidateAuth();
  // Revalidate and broadcast data refresh when the tab becomes visible/focused or comes online
  async function wake() {
    try { await revalidateAuth(); } catch {}
    try { window.dispatchEvent(new Event("pianocrm:refresh")); } catch {}
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") wake();
  });
  window.addEventListener("focus", wake);
  window.addEventListener("online", wake);
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route
          path="/portal/change-password"
          element={
            <Protected role="portal">
              <ChangePassword />
            </Protected>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Protected role="admin">
              <React.Suspense fallback={<div className="p-6">Loading…</div>}>
                <AdminApp />
              </React.Suspense>
            </Protected>
          }
        />
        <Route
          path="/portal/*"
          element={
            <Protected role="portal">
              <React.Suspense fallback={<div className="p-6">Loading…</div>}>
                <PortalApp />
              </React.Suspense>
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
  );
}
bootstrap();


