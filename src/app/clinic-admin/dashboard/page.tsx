import { ResourcePage } from "@/components/pages/resource-page";
import { getCurrentUser } from "@/server/session";
import { getClinicDashboardMetrics, getRecentInvoices } from "@/lib/services/dashboard";

export default async function ClinicAdminDashboardPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0]; // Assuming primary clinic

  if (!clinicId) {
    return <div>No clinic assigned</div>;
  }

  const [metrics, invoices] = await Promise.all([
    getClinicDashboardMetrics(clinicId),
    getRecentInvoices(clinicId)
  ]);

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

