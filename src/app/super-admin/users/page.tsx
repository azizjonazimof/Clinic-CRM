import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function SuperAdminUsersPage() {
  const user = await getCurrentUser();
  
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  const rows = users.map(u => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    status: u.status
  }));

  return (
    <ResourcePage
      role="SUPER_ADMIN"
      title="User Accounts"
      description="Manage all system users, roles, and access permissions."
      metrics={[
        { label: "Total Users", value: users.length.toString(), tone: "neutral" }
      ]}
      table={{
        title: "Platform Users",
        actionLabel: "Add User",
        createEndpoint: "/api/resources/users",
        createFields: [
          { name: "firstName", label: "First Name" },
          { name: "lastName", label: "Last Name" },
          { name: "email", label: "Email" },
          { name: "role", label: "System Role", options: ["SUPER_ADMIN", "CLINIC_ADMIN", "DOCTOR", "USER"] },
          { name: "status", label: "Status", options: ["ACTIVE", "INACTIVE", "BLOCKED"] }
        ],
        columns: [
          { key: "firstName", label: "First Name" },
          { key: "lastName", label: "Last Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
