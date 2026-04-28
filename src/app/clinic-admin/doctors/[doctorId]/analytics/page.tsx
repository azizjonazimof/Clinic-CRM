import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, services } from "@/data/mock";

export default function DoctorAnalyticsPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Doctor Analytics"
      description="Performance by revenue, consultation volume, service mix, goods usage, and sources."
      metrics={metrics}
      filters={["Branch", "Date range"]}
      chartTitle="Doctor performance trend"
      table={{
        title: "Service mix",
        columns: [
          { key: "name", label: "Service" },
          { key: "category", label: "Category" },
          { key: "price", label: "Price" },
          { key: "branch", label: "Branch" },
          { key: "status", label: "Status" }
        ],
        rows: services
      }}
    />
  );
}

