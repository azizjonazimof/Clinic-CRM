import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SuperAdminSettingsPage() {
  return (
    <AppShell role="SUPER_ADMIN" title="Settings" description="Platform profile, security, audit, and notification defaults.">
      <div className="grid gap-5 lg:grid-cols-2">
        {["Profile", "Security", "System defaults", "Audit settings"].map((section) => (
          <Card key={section}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary-600" />
              <h2 className="text-sm font-semibold text-slate-900">{section}</h2>
            </div>
            <div className="mt-4 space-y-3">
              <Input placeholder={`${section} value`} />
              <Input placeholder="Notification email" />
              <div className="flex justify-end gap-2">
                <Button variant="secondary">Cancel</Button>
                <Button>Save</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

