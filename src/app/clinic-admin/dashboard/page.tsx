import { ResourcePage } from "@/components/pages/resource-page";
import { invoices, metrics } from "@/data/mock";

export default function ClinicAdminDashboardPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Clinic Dashboard"
      description="Clinic-scoped operations summary by branch and date range."
      metrics={metrics}
      filters={["Branch", "Date range"]}
      chartTitle="Revenue and patient activity"
      table={{
        title: "Recent invoices",
        columns: [
          { key: "number", label: "Invoice" },
          { key: "patient", label: "Patient" },
          { key: "doctor", label: "Doctor" },
          { key: "total", label: "Total" },
          { key: "status", label: "Status" }
        ],
        rows: invoices
      }}
      detailSections={["Stock alerts", "Source performance", "Recent activity"]}
    />
  );
}

