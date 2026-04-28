import { ResourcePage } from "@/components/pages/resource-page";
import { patients, metrics } from "@/data/mock";

export default function DoctorDetailPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Doctor Detail"
      description="Doctor profile, branches, services, patients, and recent consultations."
      metrics={metrics.slice(0, 3)}
      filters={["Branch", "Patient status"]}
      table={{
        title: "Doctor patients",
        columns: [
          { key: "name", label: "Patient" },
          { key: "phone", label: "Phone" },
          { key: "lastVisit", label: "Last visit" },
          { key: "status", label: "Status" },
          { key: "balance", label: "Balance" }
        ],
        rows: patients
      }}
      detailSections={["Profile", "Branches", "Services", "Recent consultations", "Schedule placeholder"]}
    />
  );
}

