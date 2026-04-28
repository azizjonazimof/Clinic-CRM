import { ResourcePage } from "@/components/pages/resource-page";
import { clinics, metrics } from "@/data/mock";

export default function SuperAdminClinicsPage() {
  return (
    <ResourcePage
      role="SUPER_ADMIN"
      title="Clinics"
      description="Create, edit, suspend, and inspect clinics."
      metrics={metrics.slice(0, 3)}
      filters={["Status", "Region", "Subscription"]}
      table={{
        title: "Clinics",
        actionLabel: "Create clinic",
        columns: [
          { key: "name", label: "Name" },
          { key: "owner", label: "Owner" },
          { key: "branches", label: "Branches" },
          { key: "users", label: "Users" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created" }
        ],
        rows: clinics
      }}
      detailSections={["Create clinic modal", "Suspend confirmation"]}
    />
  );
}

