import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-admin">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
