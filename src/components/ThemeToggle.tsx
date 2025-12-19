"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuMoon, LuSun } from "react-icons/lu";
import { cn } from "@/lib/cn";

type ThemeToggleVariant = "default" | "admin";

type ThemeToggleProps = {
    variant?: ThemeToggleVariant;
};

export default function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                className={cn(
                    "h-9 w-9 rounded-full border",
                    variant === "admin" 
                        ? "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800" 
                        : "border-neo-border bg-white/50 dark:bg-neo-card/50"
                )}
            />
        );
    }

    const isDark = resolvedTheme === "dark";

    // Estilos específicos para admin en modo oscuro
    if (variant === "admin") {
        return (
            <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200",
                    isDark 
                        ? "border-slate-500 bg-slate-800 text-yellow-400 hover:border-yellow-400 hover:bg-slate-700 hover:shadow-lg hover:shadow-yellow-400/20" 
                        : "border-slate-300 bg-white text-slate-600 hover:border-neo-primary hover:text-neo-primary hover:shadow-lg hover:shadow-neo-primary/20"
                )}
                aria-label="Toggle Dark Mode"
            >
                {isDark ? (
                    <LuSun className="h-4 w-4" />
                ) : (
                    <LuMoon className="h-4 w-4" />
                )}
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neo-border bg-white text-neo-text-secondary transition hover:border-neo-primary hover:text-neo-primary hover:shadow-lg hover:shadow-neo-primary/20 dark:bg-neo-card dark:text-neo-text-primary"
            aria-label="Toggle Dark Mode"
        >
            {isDark ? (
                <LuSun className="h-4 w-4" />
            ) : (
                <LuMoon className="h-4 w-4" />
            )}
        </button>
    );
}
