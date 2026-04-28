import { ResourcePage } from "@/components/pages/resource-page";
import { invoices, metrics } from "@/data/mock";

export default function PatientDetailPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Patient Detail"
      description="Demographics, medical summary, consultations, invoices, payments, and goods usage."
      metrics={metrics.slice(0, 3)}
      filters={["History type", "Date range"]}
      table={{
        title: "Patient invoices",
        actionLabel: "Create invoice",
        columns: [
          { key: "number", label: "Invoice" },
          { key: "doctor", label: "Doctor" },
          { key: "total", label: "Total" },
          { key: "paid", label: "Paid" },
          { key: "due", label: "Due" },
          { key: "status", label: "Status" }
        ],
        rows: invoices
      }}
      detailSections={["Demographics", "Medical summary", "Consultations", "Payments", "Goods usage", "Notes and files"]}
    />
  );
}

