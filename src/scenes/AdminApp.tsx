import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import StudentsPage from "../views/admin/StudentsPage";
import StudentDetailPage from "../views/admin/StudentDetailPage";
import SchedulePage from "../views/admin/SchedulePage";
import RequestsPage from "../views/admin/RequestsPage";
import GroupsPage from "../views/admin/GroupsPage";

export default function AdminApp() {
  const nav = useNavigate();
  const { logout } = useAuth();
  function doLogout(){ logout(); nav("/login", { replace: true }); }
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 sm:h-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold text-center sm:text-left">Piano CRM - Admin</div>
          <nav className="flex flex-wrap items-center justify-center gap-2 text-sm sm:justify-end">
            <Tab to="/admin/students" label="Students" />
            <Tab to="/admin/schedule" label="Schedule" />
            <Tab to="/admin/requests" label="Requests" />
            <Tab to="/admin/groups" label="Groups" />
            <button onClick={doLogout} className="rounded-lg border px-3 py-1.5 hover:bg-slate-100">Logout</button>
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
          <Route path="*" element={<div className="text-slate-600">Pick a tab.</div>} />
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
        `rounded-lg px-3 py-1 ${isActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`
      }
    >
      {label}
    </NavLink>
  );
}
