import { ResourcePage } from "@/components/pages/resource-page";
import { doctors, metrics } from "@/data/mock";

export default function BranchDetailsPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Branch Details"
      description="Branch profile, address, doctors, rooms, services, and recent activity."
      metrics={metrics.slice(0, 3)}
      filters={["Date range", "Doctor status"]}
      table={{
        title: "Assigned doctors",
        actionLabel: "Assign doctor",
        columns: [
          { key: "name", label: "Doctor" },
          { key: "specialty", label: "Specialty" },
          { key: "activePatients", label: "Patients" },
          { key: "consultations", label: "Consultations" },
          { key: "status", label: "Status" }
        ],
        rows: doctors
      }}
      detailSections={["Branch info", "Address and contact", "Rooms", "Services"]}
    />
  );
}

