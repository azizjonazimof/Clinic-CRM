import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, products } from "@/data/mock";

export default function SupplierDetailPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Supplier Detail"
      description="Supplier profile, products, purchase history, and payments."
      metrics={metrics.slice(0, 3)}
      filters={["Product category", "Date range"]}
      table={{
        title: "Supplier products",
        columns: [
          { key: "sku", label: "SKU" },
          { key: "name", label: "Product" },
          { key: "category", label: "Category" },
          { key: "stock", label: "Stock" },
          { key: "status", label: "Status" }
        ],
        rows: products
      }}
      detailSections={["Supplier profile", "Purchase history", "Supplier payments"]}
    />
  );
}

