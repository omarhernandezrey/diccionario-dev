"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  Video,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const sections = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/terms", label: "Términos", icon: BookOpen },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/interview/live", label: "Interview Live", icon: Video },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-ink-900 via-ink-950 to-black border-r border-slate-800/50 transition-all duration-300 ease-out lg:sticky lg:translate-x-0 ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/30 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-white">Diccionario</div>
                <div className="text-xs text-slate-400">Admin Panel</div>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="rounded p-1 hover:bg-white/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = isActive(section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                    active
                      ? "bg-gradient-primary text-white shadow-lg shadow-accent-primary/30"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{section.label}</span>
                  {active && (
                    <ChevronDown className="ml-auto h-4 w-4 rotate-180" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-800/30 p-4">
            <div className="rounded-lg bg-slate-800/20 p-3 text-center text-xs text-slate-400">
              <div>© {new Date().getFullYear()}</div>
              <div className="font-semibold text-slate-300">Diccionario Dev</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(false)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-accent-primary p-2 text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
