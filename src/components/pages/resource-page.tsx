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
    createEndpoint?: string;
    createFields?: { name: string; label: string; type?: string; options?: string[] }[];
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
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleSave = async () => {
    if (!table?.createEndpoint) return;
    
    setIsSaving(true);
    try {
      const endpoint = editingId 
        ? `${table.createEndpoint}/${editingId}`
        : table.createEndpoint;
        
      const res = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || "Failed to save";
        
        if (errorMessage.toLowerCase().includes("email")) {
          setFieldErrors({ email: errorMessage });
          return;
        }
        
        throw new Error(errorMessage);
      }
      
      setModalTitle("");
      setFormData({});
      setFieldErrors({});
      setEditingId(null);
      window.location.reload(); 
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

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
              onEdit={async (row: any) => {
                setEditingId(row.id);
                setModalTitle(`Edit ${title.slice(0, -1)}`);
                setIsFetching(true);
                try {
                  const res = await fetch(`${table.createEndpoint}/${row.id}`);
                  const { data } = await res.json();
                  setFormData(data || row);
                } catch (err) {
                  console.error("Failed to fetch record for editing", err);
                  setFormData(row); // Fallback to row data
                } finally {
                  setIsFetching(false);
                }
              }}
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
                <p className="mt-1 text-sm text-slate-500">Enter the details for the new record.</p>
              </div>
              <Button aria-label="Close modal" onClick={() => setModalTitle("")} variant="ghost">
                Close
              </Button>
            </div>
            <div className="mt-5 grid gap-3">
              {isFetching ? (
                <div className="py-10 text-center text-sm text-slate-500 animate-pulse">Loading record details...</div>
              ) : (
                <>
                  {table?.createFields?.map(field => (
                    <div key={field.name}>
                      <label className="text-xs font-medium text-slate-600 uppercase mb-1 block">{field.label}</label>
                      {field.options ? (
                        <select
                          className={`h-10 w-full rounded-md border ${fieldErrors[field.name] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} px-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100`}
                          value={formData[field.name] || ""}
                          onChange={(e) => {
                            setFormData({...formData, [field.name]: e.target.value});
                            if (fieldErrors[field.name]) setFieldErrors({...fieldErrors, [field.name]: ""});
                          }}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input 
                          className={`h-10 w-full rounded-md border ${fieldErrors[field.name] ? 'border-red-500 bg-red-50' : 'border-slate-200'} px-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100`}
                          placeholder={field.label}
                          type={field.type || "text"}
                          value={formData[field.name] || ""}
                          onChange={(e) => {
                            setFormData({...formData, [field.name]: e.target.value});
                            if (fieldErrors[field.name]) setFieldErrors({...fieldErrors, [field.name]: ""});
                          }}
                        />
                      )}
                      {fieldErrors[field.name] && (
                        <p className="mt-1 text-[11px] font-medium text-red-600">{fieldErrors[field.name]}</p>
                      )}
                    </div>
                  ))}
                  {!table?.createFields && (
                    <p className="text-sm text-slate-500 italic">No fields defined for this resource.</p>
                  )}
                </>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setModalTitle("")} variant="secondary" disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
