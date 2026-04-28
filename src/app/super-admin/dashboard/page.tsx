import { ResourcePage } from "@/components/pages/resource-page";
import { clinics, metrics } from "@/data/mock";

export default function SuperAdminDashboardPage() {
  return (
    <ResourcePage
      role="SUPER_ADMIN"
      title="Platform Dashboard"
      description="Platform-wide clinic, branch, user, and revenue overview."
      metrics={metrics}
      filters={["Date range", "Clinic status", "Region"]}
      chartTitle="Clinic growth and activity"
      table={{
        title: "Recent clinics",
        columns: [
          { key: "name", label: "Clinic" },
          { key: "owner", label: "Owner" },
          { key: "region", label: "Region" },
          { key: "branches", label: "Branches" },
          { key: "status", label: "Status" }
        ],
        rows: clinics
      }}
      detailSections={["Alerts", "Recent activity"]}
    />
  );
}

