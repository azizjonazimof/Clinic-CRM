import { ResourcePage } from "@/components/pages/resource-page";
import { invoices, metrics } from "@/data/mock";

export default function InvoicesPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Invoices"
      description="Manage invoices, balances, and issuing state."
      metrics={metrics.slice(0, 3)}
      filters={["Branch", "Doctor", "Invoice status", "Date range"]}
      table={{
        title: "Invoices",
        actionLabel: "Create invoice",
        columns: [
          { key: "number", label: "Number" },
          { key: "patient", label: "Patient" },
          { key: "doctor", label: "Doctor" },
          { key: "branch", label: "Branch" },
          { key: "total", label: "Total" },
          { key: "paid", label: "Paid" },
          { key: "due", label: "Due" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created" }
        ],
        rows: invoices
      }}
    />
  );
}

