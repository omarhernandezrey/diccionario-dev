"use client";

import React from "react";
import { NotificationsProvider } from "@/components/admin/NotificationsProvider";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return <NotificationsProvider>{children}</NotificationsProvider>;
}
