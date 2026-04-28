import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AddConsultationPage() {
  return (
    <AppShell role="DOCTOR" title="Add Consultation" description="Record complaints, diagnosis, treatment plan, services, goods used, and follow-up.">
      <Card>
        <form className="grid gap-4">
          <Input placeholder="Select patient" />
          <textarea className="min-h-24 rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100" placeholder="Complaints" />
          <textarea className="min-h-24 rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100" placeholder="Diagnosis" />
          <textarea className="min-h-24 rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100" placeholder="Treatment plan" />
          <div className="grid gap-4 md:grid-cols-3">
            <Input placeholder="Services performed" />
            <Input placeholder="Goods used" />
            <Input type="date" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary">Save draft</Button>
            <Button>Complete consultation</Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}

