import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, suppliers } from "@/data/mock";

export default function SuppliersPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Suppliers"
      description="Manage suppliers, products count, balance, and status."
      metrics={metrics.slice(0, 3)}
      filters={["Status", "Balance", "Products"]}
      table={{
        title: "Suppliers",
        actionLabel: "Create supplier",
        columns: [
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "products", label: "Products" },
          { key: "balance", label: "Balance" },
          { key: "status", label: "Status" }
        ],
        rows: suppliers
      }}
    />
  );
}

