import { Link, NavLink, Outlet } from "react-router-dom";
import { Clapperboard, Ticket, UserRound } from "lucide-react";
import { useSelector } from "react-redux";
export default function Layout() {
  const user = useSelector((state) => state.auth.user);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose text-white">
              <Clapperboard size={18} />
            </span>
            Cinewave
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-400 sm:flex">
            <NavLink
              to="/movies"
              className={({ isActive }) => (isActive ? "text-white" : "")}
            >
              Explore
            </NavLink>
            {user?.role !== "admin" && (
              <NavLink
                to="/bookings"
                className={({ isActive }) => (isActive ? "text-white" : "")}
              >
                My bookings
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? "text-white" : "")}
              >
                Admin
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user?.role !== "admin" && (
              <Link
                to="/bookings"
                aria-label="Bookings"
                className="rounded-full p-2 text-slate-300 hover:bg-white/10"
              >
                <Ticket size={19} />
              </Link>
            )}
            <Link
              to="/auth"
              aria-label="Sign in or register"
              className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/10"
            >
              <UserRound size={18} />
            </Link>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="shell border-t border-white/10 py-10 text-sm text-slate-500">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <span>© 2026 Cinewave</span>
          <span>Stories worth leaving home for.</span>
        </div>
      </footer>
    </div>
  );
}
