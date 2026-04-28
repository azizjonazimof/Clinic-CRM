import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, products } from "@/data/mock";

export default function DoctorPatientDetailPage() {
  return (
    <ResourcePage
      role="DOCTOR"
      title="Patient Detail"
      description="Doctor-authorized patient profile, medical summary, consultation history, and goods usage."
      metrics={metrics.slice(0, 2)}
      filters={["Consultations", "Goods usage", "Date range"]}
      table={{
        title: "Goods used",
        columns: [
          { key: "sku", label: "SKU" },
          { key: "name", label: "Product" },
          { key: "unit", label: "Unit" },
          { key: "stock", label: "Quantity" }
        ],
        rows: products
      }}
      detailSections={["Demographics", "Medical summary", "Consultation history", "Notes"]}
    />
  );
}

