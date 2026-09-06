import { cn } from "@/core-lib/utils";

export default function CalculatorInput({
  label,
  value,
  onChange,
  type = "number",
  suffix,
  placeholder,
  className,
  min,
  max,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "number" | "text" | "date";
  suffix?: string;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cn("input", suffix && "pr-12")}
          inputMode={type === "number" ? "decimal" : undefined}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
