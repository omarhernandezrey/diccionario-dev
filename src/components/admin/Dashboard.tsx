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
  totalSearches: 0,
  totalEmptyQueries: 0,
  uniqueTerms: 0,
  languagesTotal: 0,
};

export default function AdminDashboard({ refreshToken = 0 }: { refreshToken?: number }) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics", { cache: "no-store", credentials: "include" });
        if (!res.ok) {
          if (mounted) setAnalytics(EMPTY_SUMMARY);
          return;
        }
        const payload = await res.json();
        if (!mounted) return;
        setAnalytics(payload?.summary ? (payload.summary as AnalyticsSummary) : EMPTY_SUMMARY);
      } catch (error) {
        console.error("Error cargando analytics:", error);
        if (!mounted) return;
        setAnalytics(EMPTY_SUMMARY);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [refreshToken]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-20 rounded-xl bg-neo-surface animate-pulse" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-neo-surface animate-pulse" />
          <div className="h-64 rounded-xl bg-neo-surface animate-pulse" />
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
      value: analytics.totalSearches,
      icon: <Icon library="lucide" name="Zap" className="h-5 w-5" />,
      color: "primary" as const,
    },
    {
      label: "Términos buscados",
      value: analytics.uniqueTerms,
      icon: <Icon library="lucide" name="BookOpen" className="h-5 w-5" />,
      color: "secondary" as const,
    },
    {
      label: "Lenguajes activos",
      value: analytics.languagesTotal,
      icon: <Icon library="lucide" name="TrendingUp" className="h-5 w-5" />,
      color: "emerald" as const,
    },
    {
      label: "Búsquedas vacías",
      value: analytics.totalEmptyQueries,
      icon: <Icon library="lucide" name="Users" className="h-5 w-5" />,
      color: "rose" as const,
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
        />

        {/* Contextos Donut */}
        <DonutChart
          data={contextData}
          title="Contextos de búsqueda"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Terms Line Chart */}
        <LineChartComponent
          data={topTermsData}
          title="Top 8 términos más consultados"
          dataKey="hits"
        />

        {/* Empty Queries Bar Chart */}
        <BarChartComponent
          data={emptyQueriesData}
          title="Búsquedas sin resultados"
          dataKey="attempts"
          fill="var(--chart-6)"
        />
      </div>

      {/* Top Terms Table */}
      <ChartCard title="Términos principales" description="Los 10 términos más buscados">
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <thead className="border-b border-neo-border">
              <tr className="text-neo-text-secondary">
                <th className="w-10 px-4 py-2 text-left font-semibold">#</th>
                <th className="px-4 py-2 text-left font-semibold">Término</th>
                <th className="w-28 px-4 py-2 text-right font-semibold">Búsquedas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neo-border">
              {analytics.topTerms.slice(0, 10).map((term, idx) => (
                <tr
                  key={term.termId}
                  className="hover:bg-neo-surface transition-colors"
                >
                  <td className="w-10 px-4 py-3 text-neo-text-secondary">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-neo-text-primary break-words">
                    {term.term}
                  </td>
                  <td className="w-28 px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-neo-primary/20 px-2.5 py-1 text-neo-primary">
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
