import { useId } from "react";
import { cn } from "@/lib/cn";

export type RichEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  maxLength?: number;
  className?: string;
};

export function RichEditor({ label, value, onChange, placeholder, helperText, maxLength = 2000, className }: RichEditorProps) {
  const id = useId();
  const remaining = Math.max(0, maxLength - value.length);

  return (
    <div className={cn("space-y-2 text-white", className)}>
      <label htmlFor={id} className="text-sm uppercase tracking-wide text-white/70">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="min-h-[180px] w-full rounded-2xl border border-white/10 bg-ink-900/60 p-4 text-base text-white placeholder:text-white/40 focus:border-accent-secondary focus:outline-none"
      />
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{helperText}</span>
        <span>
          {value.length}/{maxLength} ({remaining} restantes)
        </span>
      </div>
      <div className="rounded-2xl border border-white/5 bg-black/30 p-4 text-sm text-white/80">
        <p className="mb-2 font-semibold text-white">Vista previa</p>
        <p className="whitespace-pre-wrap">{value || "Empieza a escribir para ver una vista previa..."}</p>
      </div>
    </div>
  );
}
