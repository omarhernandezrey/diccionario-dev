"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import { SessionProvider } from "@/components/admin/SessionProvider";
import { NotificationsProvider } from "@/components/admin/NotificationsProvider";
import ChunkRecovery from "@/components/ChunkRecovery";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <SessionProvider>
          <NotificationsProvider>
            <ChunkRecovery />
            {children}
          </NotificationsProvider>
        </SessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
