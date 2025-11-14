import "@/app/globals.css";
import type { Story } from "@ladle/react";
import { StatCard } from "./StatCard";
import { FiActivity, FiUsers, FiDatabase } from "react-icons/fi";

export default {
  title: "UI/StatCard",
};

export const Dashboard: Story = () => (
  <div className="grid gap-4 bg-ink-900 p-6 text-white md:grid-cols-3">
    <StatCard title="Términos" value="248" helper="+12 esta semana" icon={<FiDatabase />} />
    <StatCard title="Visitas" value="18K" helper="Últimos 30 días" icon={<FiActivity />} variant="accent" />
    <StatCard title="Colaboradores" value="7" helper="Editores activos" icon={<FiUsers />} />
  </div>
);
