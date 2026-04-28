import { ResourcePage } from "@/components/pages/resource-page";
import { clinics, metrics } from "@/data/mock";

export default function SuperAdminAnalyticsPage() {
  return (
    <ResourcePage
      role="SUPER_ADMIN"
      title="Platform Analytics"
      description="Cross-clinic revenue, patient growth, and performance rankings."
      metrics={metrics}
      filters={["Date range", "Clinic", "Branch", "Region"]}
      chartTitle="Revenue and consultation trend"
      table={{
        title: "Clinic performance ranking",
        columns: [
          { key: "name", label: "Clinic" },
          { key: "region", label: "Region" },
          { key: "branches", label: "Branches" },
          { key: "users", label: "Users" },
          { key: "status", label: "Status" }
        ],
        rows: clinics
      }}
    />
  );
}

