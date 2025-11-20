"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

const sections = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/terms", label: "Términos", icon: "BookOpen" },
  { href: "/training", label: "Training", icon: "Dumbbell" },
  { href: "/interview/live", label: "Interview Live", icon: "Video" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <button
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-neo-border bg-neo-card transition-all duration-300 ease-out lg:sticky lg:translate-x-0 ${collapsed ? "-translate-x-full" : "translate-x-0"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neo-border bg-neo-bg p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-neo-primary to-neo-accent-purple text-white">
                <Icon library="lucide" name="BookOpen" className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-neo-text-primary">Diccionario</div>
                <div className="text-xs text-neo-text-secondary">Admin Panel</div>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="rounded p-1 text-neo-text-secondary hover:bg-neo-surface lg:hidden"
            >
              <Icon library="lucide" name="X" className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
            {sections.map((section) => {
              const active = isActive(section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${active
                      ? "bg-gradient-to-r from-neo-primary to-neo-accent-purple text-white shadow-lg shadow-neo-primary/30"
                      : "text-neo-text-secondary hover:bg-neo-surface hover:text-neo-text-primary"
                    }`}
                >
                  <Icon library="lucide" name={section.icon} className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{section.label}</span>
                  {active && <Icon library="lucide" name="ChevronDown" className="ml-auto h-4 w-4 rotate-180" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-neo-border p-4">
            <div className="rounded-lg border border-neo-border bg-neo-bg p-3 text-center text-xs text-neo-text-secondary">
              <div>© {new Date().getFullYear()}</div>
              <div className="font-semibold text-neo-text-primary">Diccionario Dev</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(false)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-neo-primary p-2 text-white shadow-lg shadow-neo-primary/30 lg:hidden"
      >
        <Icon library="lucide" name="Menu" className="h-5 w-5" />
      </button>
    </>
  );
}
