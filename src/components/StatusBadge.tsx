export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Normalize input: lowercase, trim, collapse spaces
  const normalized = status.trim().toLowerCase().replace(/\s+/g, " ");

  const variants: Record<string, string> = {
    "active": "bg-emerald-500/10 text-emerald-700 border-emerald-200/50",
    "inactive": "bg-slate-500/10 text-slate-700 border-slate-200/50",
    "in development": "bg-amber-500/10 text-amber-700 border-amber-200/50",
    "on hold": "bg-red-500/10 text-red-700 border-red-200/50",
  };

  const dotColors: Record<string, string> = {
    "active": "bg-emerald-500",
    "inactive": "bg-slate-500",
    "in development": "bg-amber-500",
    "on hold": "bg-red-500",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
        variants[normalized] || variants["inactive"]
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full mr-2 ${
          dotColors[normalized] || dotColors["inactive"]
        }`}
      />
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;
