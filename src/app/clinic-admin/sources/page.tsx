import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, sources } from "@/data/mock";

export default function SourcesPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Sources"
      description="Manage patient acquisition sources and performance."
      metrics={metrics.slice(0, 3)}
      filters={["Type", "Status", "Date range"]}
      table={{
        title: "Sources",
        actionLabel: "Create source",
        columns: [
          { key: "name", label: "Name" },
          { key: "type", label: "Type" },
          { key: "patients", label: "Patients" },
          { key: "revenue", label: "Revenue" },
          { key: "status", label: "Status" }
        ],
        rows: sources
      }}
    />
  );
}

