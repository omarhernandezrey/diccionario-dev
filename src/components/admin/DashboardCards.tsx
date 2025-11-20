import React from "react";
import { Icon } from "@/components/Icon";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: { value: number; direction: "up" | "down" };
  color?: "primary" | "secondary" | "emerald" | "rose";
}

const colorMap = {
  primary: "from-accent-primary/20 to-accent-primary/5 border-accent-primary/30",
  secondary: "from-accent-secondary/20 to-accent-secondary/5 border-accent-secondary/30",
  emerald: "from-accent-emerald/20 to-accent-emerald/5 border-accent-emerald/30",
  rose: "from-accent-rose/20 to-accent-rose/5 border-accent-rose/30",
};

function StatCard({
  label,
  value,
  icon,
  trend,
  color = "primary",
}: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-neo-border bg-neo-card px-5 py-6 shadow-lg transition-all duration-300 hover:shadow-glow-card hover:-translate-y-1 ${colorMap[color]}`}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-white/5 to-transparent" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-neo-text-secondary mb-2">{label}</div>
          <div className="text-3xl font-bold text-neo-text-primary">{value}</div>
          {trend && (
            <div
              className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trend.direction === "up"
                  ? "text-accent-emerald"
                  : "text-accent-rose"
                }`}
            >
              {trend.direction === "up" ? (
                <Icon library="lucide" name="TrendingUp" className="h-3 w-3" />
              ) : (
                <Icon library="lucide" name="TrendingDown" className="h-3 w-3" />
              )}
              {trend.direction === "up" ? "+" : ""}
              {trend.value}%
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neo-primary/20 text-neo-primary group-hover:bg-neo-primary/30 transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardCards({
  stats,
}: {
  stats: StatCardProps[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in">
      {stats.map((s, idx) => (
        <div key={idx} style={{ animationDelay: `${idx * 50}ms` }}>
          <StatCard {...s} />
        </div>
      ))}
    </div>
  );
}
