import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FilterBar, MetricGrid, PlaceholderChart } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { MetricCard, Role } from "@/types/domain";

type ResourcePageProps<T extends object> = {
  role: Role;
  title: string;
  description: string;
  metrics?: MetricCard[];
  filters?: string[];
  table?: {
    title: string;
    description?: string;
    columns: { key: keyof T | string; label: string }[];
    rows: T[];
    actionLabel?: string;
  };
  chartTitle?: string;
  detailSections?: string[];
};

export function ResourcePage<T extends object>({
  role,
  title,
  description,
  metrics = [],
  filters = [],
  table,
  chartTitle,
  detailSections = []
}: ResourcePageProps<T>) {
  return (
    <AppShell role={role} title={title} description={description}>
      {metrics.length ? <MetricGrid metrics={metrics} /> : null}
      {filters.length ? <FilterBar filters={filters} /> : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {table ? (
            <DataTable
              title={table.title}
              description={table.description}
              columns={table.columns}
              rows={table.rows}
              actions={
                table.actionLabel ? (
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {table.actionLabel}
                  </Button>
                ) : null
              }
            />
          ) : null}
          {chartTitle ? <PlaceholderChart title={chartTitle} /> : null}
        </div>
        {detailSections.length ? (
          <aside className="space-y-4">
            {detailSections.map((section) => (
              <Card key={section}>
                <h2 className="text-sm font-semibold text-slate-900">{section}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This section is wired for the matching API projection and will load tenant-scoped records, empty states, and audit-aware actions.
                </p>
              </Card>
            ))}
          </aside>
        ) : null}
      </div>
    </AppShell>
  );
}
