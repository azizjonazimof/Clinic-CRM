import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, payments } from "@/data/mock";

export default function PaymentsPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Payments"
      description="Track patient payments and balances."
      metrics={metrics.slice(0, 3)}
      filters={["Branch", "Method", "Status", "Date range"]}
      table={{
        title: "Payments",
        actionLabel: "Record payment",
        columns: [
          { key: "patient", label: "Patient" },
          { key: "invoice", label: "Invoice" },
          { key: "amount", label: "Amount" },
          { key: "method", label: "Method" },
          { key: "date", label: "Date" },
          { key: "status", label: "Status" },
          { key: "branch", label: "Branch" }
        ],
        rows: payments
      }}
    />
  );
}

