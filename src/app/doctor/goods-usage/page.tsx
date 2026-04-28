import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, products } from "@/data/mock";

export default function GoodsUsagePage() {
  return (
    <ResourcePage
      role="DOCTOR"
      title="Goods Usage"
      description="Track goods used by the doctor during consultations."
      metrics={metrics.slice(0, 3)}
      filters={["Patient", "Product", "Date range"]}
      table={{
        title: "Usage records",
        actionLabel: "Record usage",
        columns: [
          { key: "sku", label: "SKU" },
          { key: "name", label: "Product" },
          { key: "unit", label: "Unit" },
          { key: "stock", label: "Quantity" },
          { key: "status", label: "Status" }
        ],
        rows: products
      }}
    />
  );
}

