import { ResourcePage } from "@/components/pages/resource-page";
import { branches, metrics } from "@/data/mock";

export default function SuperAdminBranchesPage() {
  return (
    <ResourcePage
      role="SUPER_ADMIN"
      title="Branches"
      description="Manage branches across every clinic."
      metrics={metrics.slice(0, 3)}
      filters={["Clinic", "Status", "City or region"]}
      table={{
        title: "All branches",
        actionLabel: "Create branch",
        columns: [
          { key: "clinic", label: "Clinic" },
          { key: "name", label: "Branch" },
          { key: "address", label: "Address" },
          { key: "doctors", label: "Doctors" },
          { key: "patients", label: "Patients" },
          { key: "rooms", label: "Rooms" },
          { key: "status", label: "Status" }
        ],
        rows: branches
      }}
    />
  );
}

