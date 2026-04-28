import { ResourcePage } from "@/components/pages/resource-page";
import { doctors, metrics } from "@/data/mock";

export default function DoctorsPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Doctors"
      description="Manage doctors, assignments, and status."
      metrics={metrics.slice(0, 3)}
      filters={["Branch", "Specialty", "Status"]}
      table={{
        title: "Doctors",
        actionLabel: "Add doctor",
        columns: [
          { key: "name", label: "Doctor" },
          { key: "specialty", label: "Specialty" },
          { key: "branch", label: "Branch" },
          { key: "activePatients", label: "Patients" },
          { key: "consultations", label: "Consultations" },
          { key: "status", label: "Status" }
        ],
        rows: doctors
      }}
      detailSections={["Assign branch", "Deactivate confirmation"]}
    />
  );
}

