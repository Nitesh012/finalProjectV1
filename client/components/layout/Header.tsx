import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMemo, useEffect, useState } from "react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:text-foreground hover:bg-muted"
  }`;

export default function Header() {
  const location = useLocation();
  const title = useMemo(() => {
    const map: Record<string, string> = {
      "/": "Slow Learner Support",
      "/teachers": "Teacher Dashboard",
      "/students": "Student Dashboard",
      "/login": "Login",
      "/signup": "Create Account",
    };
    return map[location.pathname] ?? "Slow Learner Support";
  }, [location.pathname]);

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  // auth/navigation helpers
  const { isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">SL</span>
            <span className="hidden text-lg sm:inline">Slow Learner Support</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/teachers" className={navLinkClass}>
            Teachers
          </NavLink>
          <NavLink to="/students" className={navLinkClass}>
            Students
          </NavLink>
          <NavLink to="/resources" className={navLinkClass}>
            Resources
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-md p-2 text-sm text-foreground/80 hover:bg-muted"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.42-1.42M7.05 7.05L5.63 5.63m12.73 0l-1.42 1.42M7.05 16.95l-1.42 1.42" />
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <>
              <Link to={role === "student" ? "/students" : "/teachers"} className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground">
                Dashboard
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground">
                Log in
              </Link>
              <Link to="/signup" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="border-t bg-gradient-to-r from-primary/10 via-emerald-200/20 to-orange-200/20 dark:from-primary/20 dark:via-emerald-300/10 dark:to-orange-300/10 h-[1.5px]" />
    </header>
  );
}
