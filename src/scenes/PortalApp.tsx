import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import UpcomingPage from "../views/portal/UpcomingPage";
import ProfilePage from "../views/portal/ProfilePage";
import TermsPage from "../views/portal/TermsPage";
import FeaturesPage from "../views/portal/FeaturesPage";
import AboutPage from "../views/portal/AboutPage";

export default function PortalApp() {
  const nav = useNavigate();
  const { logout } = useAuth();
  function doLogout(){ logout(); nav("/login", { replace: true }); }
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto w-full max-w-6xl px-3 py-3 flex flex-col gap-2 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="font-semibold text-center sm:text-left">Learn Music with Ashwin - Student Portal</div>
          <nav className="flex flex-wrap items-center justify-center gap-2 text-sm sm:justify-end">
            <Tab to="/portal/home" label="Home" />
            <Tab to="/portal/profile" label="Profile" />
            <button onClick={doLogout} className="rounded-lg border px-3 py-1.5 hover:bg-slate-100">Logout</button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-3 py-6 flex-1 sm:px-4">
        <Routes>
          {/* Default to home when visiting /portal */}
          <Route index element={<UpcomingPage />} />
          {/* Use relative path to nest under /portal */}
          <Route path="home" element={<UpcomingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<div className="text-slate-600">Pick a tab.</div>} />
        </Routes>
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto w-full max-w-6xl px-3 py-4 text-sm text-slate-600 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div>© Learn Music with Ashwin</div>
          <nav className="flex flex-wrap gap-4">
            <NavLink to="/portal/terms" className="hover:text-slate-900">Terms & Fees</NavLink>
            <NavLink to="/portal/features" className="hover:text-slate-900">Portal Features</NavLink>
            <NavLink to="/portal/about" className="hover:text-slate-900">About</NavLink>
          </nav>
        </div>
      </footer>
    </div>
  );
}
function Tab({ to, label }:{ to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-1 ${isActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`
      }
    >{label}</NavLink>
  );
}
