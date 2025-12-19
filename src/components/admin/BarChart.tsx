"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "./ChartCard";

interface BarChartProps {
  data: Array<Record<string, unknown>>;
  title: string;
  dataKey: string;
  fill?: string;
}

export default function BarChartComponent({
  data,
  title,
  dataKey,
  fill = "var(--chart-3)",
}: BarChartProps) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--neo-border)"
            opacity={0.3}
          />
          <XAxis
            dataKey="name"
            stroke="var(--neo-text-secondary)"
            style={{ fontSize: "var(--admin-chart-font-size, 12px)" }}
          />
          <YAxis stroke="var(--neo-text-secondary)" style={{ fontSize: "var(--admin-chart-font-size, 12px)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--neo-card)",
              border: "1px solid var(--neo-border)",
              borderRadius: "8px",
              color: "var(--neo-text-primary)",
            }}
            labelStyle={{ color: "var(--neo-text-secondary)" }}
          />
          <Bar dataKey={dataKey} fill={fill} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
