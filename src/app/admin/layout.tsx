import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { AdminProviders } from "@/components/admin/AdminProviders";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <div className="admin-theme flex min-h-screen bg-neo-bg text-neo-text-primary">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:ml-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}
