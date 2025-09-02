import DashboardLayout from "@/components/dashboard-layout";
import { AdminProvider } from "@/provider/admin-provider";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminProvider>
  );
}
