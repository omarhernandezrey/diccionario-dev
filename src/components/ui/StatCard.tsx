import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StatCardProps = {
  title: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  variant?: "default" | "accent";
  className?: string;
};

export function StatCard({ title, value, helper, icon, variant = "default", className }: StatCardProps) {
  const base = "rounded-3xl border border-white/5 bg-ink-900/40 p-6 text-white shadow-glow";
  const variantClass = variant === "accent" ? "bg-gradient-to-br from-accent-primary/20 to-accent-secondary/30 border-accent-secondary/30" : "";

  return (
    <article className={cn(base, variantClass, className)}>
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl text-accent-secondary">{icon}</span>}
        <div>
          <p className="text-sm uppercase tracking-wide text-white/60">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
      {helper && <p className="mt-3 text-sm text-white/70">{helper}</p>}
    </article>
  );
}
