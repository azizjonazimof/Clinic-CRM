import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, products } from "@/data/mock";

export default function WarehousePage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Warehouse"
      description="Stock value, low stock, expiring products, recent movements, and top-used goods."
      metrics={metrics}
      filters={["Branch", "Product category", "Date range"]}
      chartTitle="Stock movement trend"
      table={{
        title: "Low stock products",
        columns: [
          { key: "sku", label: "SKU" },
          { key: "name", label: "Product" },
          { key: "category", label: "Category" },
          { key: "stock", label: "Stock" },
          { key: "threshold", label: "Threshold" },
          { key: "supplier", label: "Supplier" }
        ],
        rows: products
      }}
    />
  );
}

