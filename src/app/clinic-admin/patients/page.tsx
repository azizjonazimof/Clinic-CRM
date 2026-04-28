import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, patients } from "@/data/mock";

export default function PatientsPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Patients"
      description="Search and manage clinic patients."
      metrics={metrics.slice(0, 3)}
      filters={["Branch", "Doctor", "Status", "Source", "Date range"]}
      table={{
        title: "Patients",
        actionLabel: "Create patient",
        columns: [
          { key: "name", label: "Full name" },
          { key: "phone", label: "Phone" },
          { key: "branch", label: "Branch" },
          { key: "assignedDoctor", label: "Doctor" },
          { key: "lastVisit", label: "Last visit" },
          { key: "status", label: "Status" },
          { key: "balance", label: "Balance" }
        ],
        rows: patients
      }}
      detailSections={["Create patient modal", "Archive confirmation"]}
    />
  );
}

