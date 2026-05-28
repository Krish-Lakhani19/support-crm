import { Outlet, NavLink, useNavigate } from "react-router-dom";

function NavItem({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-colors duration-150 ${
          isActive
            ? "bg-[#21262d] text-[#e6edf3]"
            : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/60"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d1117]">
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-[#30363d] bg-[#161b22]">
        <div className="px-4 py-5 border-b border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#2f81f7] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1C3.686 1 1 3.686 1 7s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 7.75A4.375 4.375 0 012.875 9.25c.018-1.458 2.917-2.25 4.125-2.25s4.107.792 4.125 2.25A4.375 4.375 0 017 11.25z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-[#e6edf3] font-semibold text-sm tracking-tight">
              Support CRM
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-[#484f58] uppercase tracking-widest px-3 mb-2">
            Main
          </p>

          <NavItem to="/" end>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M1 1h5v5H1V1zm0 8h5v5H1V9zm8-8h5v5H9V1zm0 8h5v5H9V9z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dashboard
          </NavItem>

          <NavItem to="/tickets/new">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M7.5 2v11M2 7.5h11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            New Ticket
          </NavItem>

          <div className="pt-3">
            <p className="text-[10px] font-semibold text-[#484f58] uppercase tracking-widest px-3 mb-2">
              Filters
            </p>

            <NavItem to="/?status=Open">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              Open
            </NavItem>
            <NavItem to="/?status=In+Progress">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              In Progress
            </NavItem>
            <NavItem to="/?status=Closed">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
              Closed
            </NavItem>
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-[#30363d]">
          <p className="text-[11px] text-[#484f58]">v1.0.0</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
