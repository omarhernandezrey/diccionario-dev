"use client";

import React, { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
}

export default function ChartCard({
  title,
  description,
  children,
  compact,
}: ChartCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-800/30 bg-gradient-card shadow-lg-light transition-all duration-300 hover:shadow-xl-card hover:border-slate-700/50 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100 bg-gradient-to-br from-white/5 to-transparent" />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
