"use client";

import { useState } from "react";
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
  const [modalTitle, setModalTitle] = useState("");

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
                  <Button onClick={() => setModalTitle(table.actionLabel ?? table.title)}>
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
      {modalTitle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">{modalTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">This action is ready to connect to the matching production API endpoint.</p>
              </div>
              <Button aria-label="Close modal" onClick={() => setModalTitle("")} variant="ghost">
                Close
              </Button>
            </div>
            <div className="mt-5 grid gap-3">
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100" placeholder="Name or title" />
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100" placeholder="Status or category" />
              <textarea className="min-h-24 rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100" placeholder="Notes" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setModalTitle("")} variant="secondary">
                Cancel
              </Button>
              <Button onClick={() => setModalTitle("")}>Save</Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
