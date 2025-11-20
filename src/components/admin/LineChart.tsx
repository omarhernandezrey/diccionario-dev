"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "./ChartCard";

interface LineChartProps {
  data: Array<Record<string, unknown>>;
  title: string;
  dataKey: string;
  stroke?: string;
}

export default function LineChartComponent({
  data,
  title,
  dataKey,
  stroke = "#6c63ff",
}: LineChartProps) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--neo-border)"
            opacity={0.3}
          />
          <XAxis
            dataKey="name"
            stroke="var(--neo-text-secondary)"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="var(--neo-text-secondary)" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--neo-card)",
              border: "1px solid var(--neo-border)",
              borderRadius: "8px",
              color: "var(--neo-text-primary)",
            }}
            labelStyle={{ color: "var(--neo-text-secondary)" }}
            cursor={{ stroke: "var(--neo-border)", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            dot={{ fill: stroke, r: 4 }}
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
