"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
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

export default function DonutChart({
  data,
  title,
  colors = defaultColors,
}: DonutChartProps) {
  return (
    <ChartCard title={title} compact>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value} items`}
            contentStyle={{
              backgroundColor: "var(--neo-card)",
              border: "1px solid var(--neo-border)",
              borderRadius: "8px",
              color: "var(--neo-text-primary)",
            }}
            labelStyle={{ color: "var(--neo-text-secondary)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
