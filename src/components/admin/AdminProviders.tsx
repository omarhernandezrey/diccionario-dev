"use client";

import React from "react";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  // Session + Notifications ya se proveen en AppProviders (layout raíz)
  return <>{children}</>;
}
