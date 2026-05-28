export default function StatusBadge({ status, size = "sm" }) {
  const variants = {
    Open: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    "In Progress": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    Closed: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-medium tracking-wide ${variants[status] || variants.Open} ${sizes[size]}`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, size = "sm" }) {
  const variants = {
    Critical: "bg-red-500/10 text-red-400 border border-red-500/20",
    High: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    Medium: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    Low: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-medium tracking-wide ${variants[priority] || variants.Medium} ${sizes[size]}`}
    >
      {priority}
    </span>
  );
}
