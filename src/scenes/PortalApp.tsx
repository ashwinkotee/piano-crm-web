import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import UpcomingPage from "../views/portal/UpcomingPage";
import ProfilePage from "../views/portal/ProfilePage";
import TermsPage from "../views/portal/TermsPage";
import FeaturesPage from "../views/portal/FeaturesPage";
import AboutPage from "../views/portal/AboutPage";
import CompleteProfilePage from "../views/portal/CompleteProfilePage";

export default function PortalApp() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('portal-theme') as 'dark' | 'light' | null) || 'dark');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('portal-theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }, [theme]);

  function doLogout() {
    logout();
    nav("/login", { replace: true });
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'theme-dark' : 'theme-light'} portal-bg`}>
      <div className="flex h-full w-full">
        {/* Desktop sidebar */}
        <aside className={`neo-sidebar ${theme === 'dark' ? 'glass' : 'glass-light'} hidden w-60 flex-col p-4 md:flex`}>
          <div className="mb-6 flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400" />
            <div className="text-sm font-semibold">Ashwin&apos;s Piano Studio</div>
          </div>
          <nav className="flex flex-1 flex-col gap-1 text-sm">
            <SideLink to="/portal/home" label="Home" />
            <SideLink to="/portal/profile" label="Profile" />
            <SideLink to="/portal/terms" label="Terms & Conditions" />
          </nav>
          <div className="mt-4 flex items-center justify-between gap-2 text-xs">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20 focus-ring"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm10 7h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2ZM3 11H2a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2Zm15.657 7.071-0.707-0.707a1 1 0 1 1 1.414-1.414l0.707 0.707a1 1 0 1 1-1.414 1.414ZM5.636 6.343 4.93 5.636A1 1 0 0 1 6.343 4.22l0.707 0.707A1 1 0 0 1 5.636 6.343Zm12.021-2.122 0.707-0.707A1 1 0 0 1 19.778 4.93l-0.707 0.707a1 1 0 0 1-1.414-1.414ZM4.222 19.778l0.707-0.707a1 1 0 0 1 1.414 1.414l-0.707 0.707A1 1 0 0 1 4.222 19.778Z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"/></svg>
              )}
            </button>
            <button onClick={doLogout} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20 focus-ring">Logout</button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* Header */}
          <header className={`${theme === 'dark' ? 'glass' : 'glass-light'} sticky top-0 z-10 border-b border-white/10`}>
            <div className="w-full px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Ashwin&apos;s Piano Studio · Student Portal</div>
                {/* Mobile actions */}
                <div className="md:hidden flex items-center gap-2">
                  <button aria-label="Toggle menu" className="rounded-lg px-3 py-2 hover:bg-white/10 focus-ring" onClick={() => setMobileOpen((v) => !v)}>
                    <span className="block h-0.5 w-5 bg-current mb-1"></span>
                    <span className="block h-0.5 w-5 bg-current mb-1"></span>
                    <span className="block h-0.5 w-5 bg-current"></span>
                  </button>
                  <button aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-lg px-3 py-2 hover:bg-white/10 focus-ring" title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
                    {theme === 'dark' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm10 7h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2ZM3 11H2a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2Zm15.657 7.071-0.707-0.707a1 1 0 1 1 1.414-1.414l0.707 0.707a1 1 0 1 1-1.414 1.414ZM5.636 6.343 4.93 5.636A1 1 0 0 1 6.343 4.22l0.707 0.707A1 1 0 0 1 5.636 6.343Zm12.021-2.122 0.707-0.707A1 1 0 0 1 19.778 4.93l-0.707 0.707a1 1 0 0 1-1.414-1.414ZM4.222 19.778l0.707-0.707a1 1 0 0 1 1.414 1.414l-0.707 0.707A1 1 0 0 1 4.222 19.778Z"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"/></svg>
                    )}
                  </button>
                </div>
              </div>
              {mobileOpen && (
                <div className={`md:hidden mt-2 rounded-xl p-2 ${theme === 'dark' ? 'glass' : 'glass-light'}`}>
                  <div className="flex flex-col">
                    <NavLink onClick={() => setMobileOpen(false)} to="/portal/home" className="rounded-lg px-3 py-2 hover:bg-white/10">Home</NavLink>
                    <NavLink onClick={() => setMobileOpen(false)} to="/portal/profile" className="rounded-lg px-3 py-2 hover:bg-white/10">Profile</NavLink>
                    <NavLink onClick={() => setMobileOpen(false)} to="/portal/terms" className="rounded-lg px-3 py-2 hover:bg-white/10">Terms & Conditions</NavLink>
                    <button onClick={() => { setMobileOpen(false); doLogout(); }} className="text-left rounded-lg px-3 py-2 hover:bg-white/10">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Routes */}
          <main className="w-full flex-1 px-4 py-6">
            <Routes>
              <Route index element={<UpcomingPage />} />
              <Route path="home" element={<UpcomingPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="complete-profile" element={<CompleteProfilePage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="*" element={<div className="text-slate-300">Pick a tab.</div>} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className={`${theme === 'dark' ? 'glass' : 'glass-light'} border-t border-white/10`}>
            <div className="w-full px-4 py-4 text-xs text-slate-300 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>© Ashwin&apos;s Piano Studio · Student Portal {import.meta.env.VITE_APP_VERSION ? `v${import.meta.env.VITE_APP_VERSION}` : ''}</div>
              <nav className="flex flex-wrap gap-4">
                <NavLink to="/portal/terms" className="hover:text-white">Terms and Conditions</NavLink>
                <NavLink to="/portal/complete-profile" className="hover:text-white">Complete Profile</NavLink>
                <NavLink to="/portal/features" className="hover:text-white">Portal Features</NavLink>
                <NavLink to="/portal/about" className="hover:text-white">About</NavLink>
              </nav>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 transition-colors ${isActive ? 'bg-white/15 text-white' : 'hover:bg-white/10 text-slate-300'}`
      }
    >
      {label}
    </NavLink>
  );
}





