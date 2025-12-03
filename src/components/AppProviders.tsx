"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import { SessionProvider } from "@/components/admin/SessionProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <SessionProvider>{children}</SessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
