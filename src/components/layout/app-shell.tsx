import { Bell, LogOut } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types/domain";

export function AppShell({ role, title, description, children }: { role: Role; title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={role} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div>
              <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
              {description ? <p className="text-sm text-slate-500">{description}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="secondary">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="space-y-5 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

