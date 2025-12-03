"use client";

import { useState } from "react";
import Link from "next/link";
import { User, LogOut, UserPlus, LogIn } from "lucide-react";
import { useSession, notifySessionChange } from "@/components/admin/SessionProvider";
import { AuthModal } from "./AuthModal";

export function AuthActions() {
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    await notifySessionChange();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-24 rounded-full bg-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      {session ? (
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-500/30">
            {session.displayName || session.username}
          </div>
          <Link
            href="/admin/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:text-white"
          >
            <User className="h-4 w-4" />
            Perfil
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode("login"); setOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </button>
          <button
            onClick={() => { setMode("register"); setOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-emerald-950 hover:bg-emerald-400"
          >
            <UserPlus className="h-4 w-4" />
            Registrarse
          </button>
        </div>
      )}

      <AuthModal open={open} onClose={() => setOpen(false)} defaultMode={mode} />
    </>
  );
}
