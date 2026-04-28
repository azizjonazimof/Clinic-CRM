import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, patients } from "@/data/mock";

export default function DoctorPatientsPage() {
  return (
    <ResourcePage
      role="DOCTOR"
      title="My Patients"
      description="Patients assigned to or consulted by the logged-in doctor."
      metrics={metrics.slice(0, 2)}
      filters={["Status", "Date range"]}
      table={{
        title: "My patients",
        columns: [
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "lastVisit", label: "Last consultation" },
          { key: "status", label: "Status" }
        ],
        rows: patients
      }}
    />
  );
}

