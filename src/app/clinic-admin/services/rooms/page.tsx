import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function RoomsPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const rooms = await prisma.room.findMany({
    where: { branch: { clinicId } },
    include: { branch: true },
    orderBy: { name: "asc" }
  });

  const rows = rooms.map(r => ({
    id: r.id,
    name: r.name,
    branch: r.branch.name,
    type: r.type || "Examination",
    status: r.status
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Clinic Rooms"
      description="Manage examination rooms, theaters, and offices."
      metrics={[
        { label: "Total Rooms", value: rooms.length.toString(), tone: "neutral" }
      ]}
      filters={["Branch", "Status"]}
      table={{
        title: "Room Directory",
        actionLabel: "Add Room",
        createEndpoint: "/api/resources/rooms",
        createFields: [
          { name: "name", label: "Room Name/Number" },
          { name: "type", label: "Room Type", options: ["Examination", "Surgery", "Office", "Lab"] }
        ],
        columns: [
          { key: "name", label: "Room" },
          { key: "branch", label: "Branch" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
