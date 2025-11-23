"use client";

import React from "react";
import { NotificationsProvider } from "@/components/admin/NotificationsProvider";
import { SessionProvider } from "@/components/admin/SessionProvider";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationsProvider>{children}</NotificationsProvider>
    </SessionProvider>
  );
}
