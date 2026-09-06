import { cn } from "@/core-lib/utils";

export default function ResultCard({
  label,
  value,
  helper,
  emphasis = false,
  className,
}: {
  label: string;
  value: string;
  helper?: string;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-ink-200 bg-ink-50 px-4 py-3", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className={cn("mt-1 font-semibold text-ink-900", emphasis ? "text-2xl" : "text-lg")}>
        {value}
      </p>
      {helper && <p className="mt-0.5 text-xs text-ink-500">{helper}</p>}
    </div>
  );
}
