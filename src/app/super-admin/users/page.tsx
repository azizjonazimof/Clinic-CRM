import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, users } from "@/data/mock";

export default function SuperAdminUsersPage() {
  return (
    <ResourcePage
      role="SUPER_ADMIN"
      title="Users"
      description="Manage users, roles, and clinic or branch assignments."
      metrics={metrics.slice(0, 3)}
      filters={["Role", "Clinic", "Branch", "Status"]}
      table={{
        title: "Global users",
        actionLabel: "Create user",
        columns: [
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "clinicScope", label: "Clinic scope" },
          { key: "branchScope", label: "Branch scope" },
          { key: "status", label: "Status" },
          { key: "lastLogin", label: "Last login" }
        ],
        rows: users
      }}
      detailSections={["Role assignment", "Password reset", "Deactivate user"]}
    />
  );
}

