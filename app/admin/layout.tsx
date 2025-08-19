import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminProvider } from "@/provider/admin-provider";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminProvider>
      <div className="h-screen grid grid-cols-[256px_1fr] grid-rows-[64px_1fr] gap-0 overflow-hidden">
        <div className="col-span-1 row-span-2 w-full h-full">
          <AdminSidebar />
        </div>
        <div className="w-full h-full">
          <AdminHeader />
        </div>
        <main className="h-full overflow-auto p-8">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </AdminProvider>
  );
}
