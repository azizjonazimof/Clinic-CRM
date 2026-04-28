import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, rooms } from "@/data/mock";

export default function RoomsPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Rooms"
      description="Manage rooms under the Services module."
      metrics={metrics.slice(0, 2)}
      filters={["Branch", "Room type", "Status"]}
      table={{
        title: "Rooms",
        actionLabel: "Create room",
        columns: [
          { key: "branch", label: "Branch" },
          { key: "name", label: "Room" },
          { key: "type", label: "Type" },
          { key: "services", label: "Services" },
          { key: "status", label: "Status" }
        ],
        rows: rooms
      }}
    />
  );
}

