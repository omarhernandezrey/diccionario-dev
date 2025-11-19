"use client";

import React, { useEffect, useState } from "react";
import DashboardCards from "@/components/admin/DashboardCards";
import DonutChart from "@/components/admin/DonutChart";
import LineChartComponent from "@/components/admin/LineChart";
import BarChartComponent from "@/components/admin/BarChart";
import ChartCard from "@/components/admin/ChartCard";
import { Icon } from "@/components/Icon";
import type { AnalyticsSummary } from "@/lib/analytics";

const EMPTY_SUMMARY: AnalyticsSummary = {
  topTerms: [],
  languages: [],
  contexts: [],
  emptyQueries: [],
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics", { credentials: "include" });
        if (!res.ok) return;
        const payload = await res.json();
        if (payload?.summary) {
          setAnalytics(payload.summary as AnalyticsSummary);
        } else {
          setAnalytics(EMPTY_SUMMARY);
        }
      } catch (error) {
        console.error("Error cargando analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-20 rounded-xl bg-slate-800/20 animate-pulse" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-slate-800/20 animate-pulse" />
          <div className="h-64 rounded-xl bg-slate-800/20 animate-pulse" />
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const categoryData = analytics.languages.slice(0, 8).map((lang) => ({
    name: lang.language.toUpperCase(),
    value: lang.count,
  }));

  const contextData = analytics.contexts.slice(0, 6).map((ctx) => ({
    name: ctx.context,
    value: ctx.count,
  }));

  const topTermsData = analytics.topTerms.slice(0, 8).map((term) => ({
    name: term.term,
    hits: term.hits,
  }));

  const emptyQueriesData = analytics.emptyQueries.slice(0, 8).map((query) => ({
    name: query.query,
    attempts: query.attempts,
  }));

  // Stats para cards
  const stats = [
      {
        label: "Total de búsquedas",
        value: analytics.topTerms.reduce((sum, t) => sum + t.hits, 0) +
          contextData.reduce((sum, c) => sum + c.value, 0),
        icon: <Icon library="lucide" name="Zap" className="h-5 w-5" />,
        color: "primary" as const,
        trend: { value: 12, direction: "up" as const },
      },
      {
        label: "Términos buscados",
        value: analytics.topTerms.length,
        icon: <Icon library="lucide" name="BookOpen" className="h-5 w-5" />,
        color: "secondary" as const,
        trend: { value: 8, direction: "up" as const },
      },
      {
        label: "Lenguajes activos",
        value: analytics.languages.length,
        icon: <Icon library="lucide" name="TrendingUp" className="h-5 w-5" />,
        color: "emerald" as const,
        trend: { value: 5, direction: "up" as const },
      },
      {
        label: "Búsquedas vacías",
        value: analytics.emptyQueries.reduce((sum, q) => sum + q.attempts, 0),
        icon: <Icon library="lucide" name="Users" className="h-5 w-5" />,
        color: "rose" as const,
        trend: { value: 3, direction: "down" as const },
      },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <DashboardCards stats={stats} />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lenguajes Donut */}
        <DonutChart
          data={categoryData}
          title="Lenguajes más buscados"
          colors={[
            "#6c63ff",
            "#80e0ff",
            "#5ce9b9",
            "#f59e0b",
            "#f43f5e",
            "#8b5cf6",
            "#06b6d4",
            "#ec4899",
          ]}
        />

        {/* Contextos Donut */}
        <DonutChart
          data={contextData}
          title="Contextos de búsqueda"
          colors={["#06b6d4", "#80e0ff", "#6c63ff", "#5ce9b9", "#f59e0b", "#f43f5e"]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Terms Line Chart */}
        <LineChartComponent
          data={topTermsData}
          title="Top 8 términos más consultados"
          dataKey="hits"
          stroke="#6c63ff"
        />

        {/* Empty Queries Bar Chart */}
        <BarChartComponent
          data={emptyQueriesData}
          title="Búsquedas sin resultados"
          dataKey="attempts"
          fill="#f43f5e"
        />
      </div>

      {/* Top Terms Table */}
      <ChartCard title="Términos principales" description="Los 10 términos más buscados">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700/50">
              <tr className="text-slate-400">
                <th className="px-4 py-2 text-left font-semibold">#</th>
                <th className="px-4 py-2 text-left font-semibold">Término</th>
                <th className="px-4 py-2 text-right font-semibold">Búsquedas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {analytics.topTerms.slice(0, 10).map((term, idx) => (
                <tr
                  key={term.termId}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    {term.term}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-accent-primary/20 px-2.5 py-1 text-accent-primary">
                      {term.hits}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
