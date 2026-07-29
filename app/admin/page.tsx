import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ProductionAdminNotice } from "@/components/admin/ProductionAdminNotice";

export default function AdminPage() {
  if (process.env.NODE_ENV !== "development") {
    return <ProductionAdminNotice />;
  }

  return <AdminDashboard />;
}
