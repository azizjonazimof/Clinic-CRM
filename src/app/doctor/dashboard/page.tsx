import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, patients } from "@/data/mock";

export default function DoctorDashboardPage() {
  return (
    <ResourcePage
      role="DOCTOR"
      title="Doctor Dashboard"
      description="Daily work, assigned patients, consultations, notes, and goods usage alerts."
      metrics={metrics.slice(0, 3)}
      filters={["Today", "This week", "Date range"]}
      table={{
        title: "Assigned patients",
        columns: [
          { key: "name", label: "Patient" },
          { key: "phone", label: "Phone" },
          { key: "lastVisit", label: "Last consultation" },
          { key: "status", label: "Status" }
        ],
        rows: patients
      }}
      detailSections={["Today's consultations", "Recent notes", "Goods usage alerts"]}
    />
  );
}

