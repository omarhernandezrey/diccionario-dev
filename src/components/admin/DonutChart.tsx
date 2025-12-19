"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import ChartCard from "./ChartCard";

interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  colors?: string[];
}

const defaultColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

// Componente personalizado para el Tooltip
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-neo-border bg-neo-card px-3 py-2 shadow-xl">
        <p className="flex items-center gap-2 text-sm font-medium text-neo-text-primary">
          <span 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: data.payload.fill }}
          />
          {data.name}
        </p>
        <p className="text-lg font-bold text-neo-primary">{data.value} búsquedas</p>
      </div>
    );
  }
  return null;
};

// Componente personalizado para la Leyenda
const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
  if (!payload) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-2 pt-4">
      {payload.map((entry, index) => (
        <li key={`legend-${index}`} className="flex items-center gap-2 text-xs">
          <span 
            className="h-2.5 w-2.5 rounded-full shrink-0" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-neo-text-secondary font-medium">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default function DonutChart({
  data,
  title,
  colors = defaultColors,
}: DonutChartProps) {
  return (
    <ChartCard title={title} compact>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
