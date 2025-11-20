"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

export default function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-9 w-9 rounded-full border border-neo-border bg-white/50 dark:bg-neo-card/50" />
        );
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neo-border bg-white text-neo-text-secondary transition hover:border-neo-primary hover:text-neo-primary hover:shadow-lg hover:shadow-neo-primary/20 dark:bg-neo-card dark:text-neo-text-primary"
            aria-label="Toggle Dark Mode"
        >
            {resolvedTheme === "dark" ? (
                <LuMoon className="h-4 w-4" />
            ) : (
                <LuSun className="h-4 w-4" />
            )}
        </button>
    );
}
