import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { AdminProviders } from "@/components/admin/AdminProviders";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <div className="dd-admin flex min-h-screen bg-neo-bg text-neo-text-primary font-sans">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1">
            <div className="p-4 sm:p-6 md:p-8">
              <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px]">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}
