import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ticketsApi } from "../api/client";
import StatusBadge, { PriorityBadge } from "../components/StatusBadge";

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-5 py-4">
      <p className="text-[#8b949e] text-xs font-medium uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-semibold font-mono ${accent || "text-[#e6edf3]"}`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const searchTimer = useRef(null);

  const activeStatus = searchParams.get("status") || "";
  const activePriority = searchParams.get("priority") || "";
  const activeSearch = searchParams.get("search") || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeStatus) params.status = activeStatus;
      if (activePriority) params.priority = activePriority;
      if (activeSearch) params.search = activeSearch;

      const [ticketsRes, statsRes] = await Promise.all([
        ticketsApi.list(params),
        ticketsApi.stats(),
      ]);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError("Failed to load tickets. Make sure the API server is running.");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, activePriority, activeSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (val) {
        next.set("search", val);
      } else {
        next.delete("search");
      }
      setSearchParams(next);
    }, 300);
  };

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const hasFilters = activeStatus || activePriority || activeSearch;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-[#30363d] px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[#e6edf3] font-semibold text-lg">Tickets</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">
            {stats.total} total across all statuses
          </p>
        </div>
        <button
          onClick={() => navigate("/tickets/new")}
          className="flex items-center gap-2 bg-[#2f81f7] hover:bg-[#388bfd] text-white text-sm font-medium px-4 py-2 rounded transition-colors duration-150"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M6.5 1v11M1 6.5h11"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          New Ticket
        </button>
      </div>

      <div className="px-6 py-4 border-b border-[#30363d] flex-shrink-0">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Open" value={stats.open} accent="text-emerald-400" />
          <StatCard label="In Progress" value={stats.in_progress} accent="text-amber-400" />
          <StatCard label="Closed" value={stats.closed} accent="text-slate-400" />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M9.5 9.5l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full bg-[#21262d] border border-[#30363d] rounded text-[#e6edf3] text-sm pl-9 pr-3 py-2 placeholder-[#484f58] focus:outline-none focus:border-[#2f81f7] transition-colors duration-150"
            />
          </div>

          <div className="flex items-center gap-2">
            {["Open", "In Progress", "Closed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter("status", activeStatus === s ? "" : s)}
                className={`text-xs px-3 py-2 rounded border font-medium transition-colors duration-150 ${
                  activeStatus === s
                    ? "border-[#2f81f7] bg-[#2f81f7]/10 text-[#2f81f7]"
                    : "border-[#30363d] text-[#8b949e] hover:border-[#484f58] hover:text-[#e6edf3]"
                }`}
              >
                {s}
              </button>
            ))}

            <select
              value={activePriority}
              onChange={(e) => setFilter("priority", e.target.value)}
              className="bg-[#21262d] border border-[#30363d] rounded text-[#8b949e] text-xs px-3 py-2 focus:outline-none focus:border-[#2f81f7] transition-colors duration-150"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-[#8b949e] hover:text-[#e6edf3] px-2 py-2 transition-colors duration-150"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="m-6 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex items-center gap-3 text-[#8b949e] text-sm">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Loading tickets...
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-[#8b949e] text-sm mb-1">No tickets found</p>
            <p className="text-[#484f58] text-xs">
              {hasFilters ? "Try adjusting your filters" : "Create a new ticket to get started"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#30363d]">
                {["Ticket ID", "Customer", "Subject", "Status", "Priority", "Created"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold text-[#484f58] uppercase tracking-wider px-6 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, i) => (
                <tr
                  key={ticket.ticket_id}
                  onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                  className={`border-b border-[#30363d]/50 cursor-pointer transition-colors duration-100 hover:bg-[#161b22] ${
                    i % 2 === 0 ? "bg-transparent" : "bg-[#161b22]/30"
                  }`}
                >
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-xs text-[#2f81f7] font-medium">
                      {ticket.ticket_id}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-sm text-[#e6edf3] font-medium">
                      {ticket.customer_name}
                    </p>
                    <p className="text-xs text-[#484f58] mt-0.5">
                      {ticket.customer_email}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 max-w-xs">
                    <p className="text-sm text-[#e6edf3] truncate">
                      {ticket.subject}
                    </p>
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-6 py-3.5 text-xs text-[#8b949e] whitespace-nowrap">
                    {formatDate(ticket.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
