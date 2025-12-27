"use client";

import { useState } from "react";
import { LogOut, UserPlus, LogIn } from "lucide-react";
import { useSession, notifySessionChange } from "@/components/admin/SessionProvider";
import { AuthModal } from "./AuthModal";

type AuthActionsProps = {
  variant?: "default" | "compact";
  layout?: "row" | "stacked";
};

export function AuthActions({ variant = "default", layout = "row" }: AuthActionsProps) {
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

  const containerClass = layout === "stacked" ? "flex flex-col gap-2 w-full" : "flex items-center gap-2";
  const loginClass =
    variant === "compact"
      ? "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:border-emerald-500/50 hover:text-white"
      : "inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:text-white";

  const registerClass =
    variant === "compact"
      ? "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-emerald-950 hover:bg-emerald-400"
      : "inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-emerald-950 hover:bg-emerald-400";

  const logoutClass =
    variant === "compact"
      ? "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-200 hover:bg-red-500/20"
      : "inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/20";

  return (
    <>
      {session ? (
        <div className={containerClass}>
          <button
            type="button"
            onClick={handleLogout}
            className={logoutClass}
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      ) : (
        <div className={containerClass}>
          <button
            type="button"
            onClick={() => { setMode("login"); setOpen(true); }}
            className={loginClass}
          >
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setOpen(true); }}
            className={registerClass}
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
