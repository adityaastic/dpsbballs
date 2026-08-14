import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Panel | DSP Precision",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminAuthProvider>
  );
}
