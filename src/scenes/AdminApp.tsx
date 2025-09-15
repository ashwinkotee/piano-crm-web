import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import StudentsPage from "../views/admin/StudentsPage";
import StudentDetailPage from "../views/admin/StudentDetailPage";
import SchedulePage from "../views/admin/SchedulePage";
import RequestsPage from "../views/admin/RequestsPage";
import GroupsPage from "../views/admin/GroupsPage";
import Button from "../components/ui/Button";

export default function AdminApp() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('portal-theme') as 'dark' | 'light' | null) || 'light');

  useEffect(() => {
    localStorage.setItem('portal-theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }, [theme]);

  function doLogout(){ logout(); nav("/login", { replace: true }); }
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'theme-dark' : 'theme-light'} portal-bg`}>
      <header className={`${theme === 'dark' ? 'glass' : 'glass-light'} border-b border-white/10`}>
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 sm:h-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold text-center sm:text-left">Piano CRM - Admin</div>
          <nav className="flex flex-wrap items-center justify-center gap-2 text-sm sm:justify-end">
            <Tab to="/admin/students" label="Students" />
            <Tab to="/admin/schedule" label="Schedule" />
            <Tab to="/admin/requests" label="Requests" />
            <Tab to="/admin/groups" label="Groups" />
            <Button size="sm" variant="secondary"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button size="sm" variant="secondary" onClick={doLogout}>Logout</Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="*" element={<div className="text-slate-300">Pick a tab.</div>} />
        </Routes>
      </main>
    </div>
  );
}

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-1 transition-colors ${isActive ? 'bg-white/15 text-white' : 'hover:bg-white/10 text-slate-300'}`
      }
    >
      {label}
    </NavLink>
  );
}
