"use client";

import DiccionarioDevApp from "@/components/DiccionarioDevApp";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Suspense fallback={null}>
        <DiccionarioDevApp />
      </Suspense>
    </main>
  );
}
