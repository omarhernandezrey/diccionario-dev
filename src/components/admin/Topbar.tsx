"use client";

import React, { useState } from "react";
import { Search, Bell, Settings, LogOut, User, ChevronDown } from "lucide-react";

export default function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/30 bg-gradient-to-r from-ink-900/95 to-ink-950/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Search */}
        <div className="flex flex-1 items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar términos..."
              className="rounded-lg border border-slate-800 bg-slate-800/20 py-1.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 transition focus:border-accent-primary focus:bg-slate-800/40 focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800/50 hover:text-white transition">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent-rose" />
          </button>

          {/* Settings */}
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/50 hover:text-white transition">
            <Settings className="h-5 w-5" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-800/50" />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-white transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-white">
                O
              </div>
              <span className="hidden sm:inline">Omar</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-800 bg-gradient-card shadow-xl animate-slide-up">
                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
                  <User className="h-4 w-4" />
                  Perfil
                </button>
                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
                  <Settings className="h-4 w-4" />
                  Preferencias
                </button>
                <div className="border-t border-slate-800/30" />
                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-accent-rose hover:bg-slate-800/50 transition">
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
