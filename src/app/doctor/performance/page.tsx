import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, services } from "@/data/mock";

export default function DoctorPerformancePage() {
  return (
    <ResourcePage
      role="DOCTOR"
      title="My Performance"
      description="Personal consultations, patients served, services performed, goods used, and permitted revenue."
      metrics={metrics}
      filters={["Date range"]}
      chartTitle="Personal performance trend"
      table={{
        title: "Services performed",
        columns: [
          { key: "name", label: "Service" },
          { key: "category", label: "Category" },
          { key: "price", label: "Price" },
          { key: "status", label: "Status" }
        ],
        rows: services
      }}
    />
  );
}

