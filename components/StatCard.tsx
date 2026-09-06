import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="card flex items-start gap-3 p-4">
      <div className="rounded-lg bg-brand-50 p-2">
        <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <p className="mt-0.5 text-lg font-semibold text-ink-900">{value}</p>
        {helper && <p className="text-xs text-ink-400">{helper}</p>}
      </div>
    </div>
  );
}
