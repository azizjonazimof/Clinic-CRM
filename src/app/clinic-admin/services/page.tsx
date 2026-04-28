import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, services } from "@/data/mock";

export default function ServicesPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Services"
      description="Manage billable clinic services."
      metrics={metrics.slice(0, 3)}
      filters={["Branch", "Category", "Status"]}
      table={{
        title: "Services",
        actionLabel: "Create service",
        columns: [
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "price", label: "Price" },
          { key: "duration", label: "Duration" },
          { key: "branch", label: "Branch" },
          { key: "status", label: "Status" }
        ],
        rows: services
      }}
    />
  );
}

