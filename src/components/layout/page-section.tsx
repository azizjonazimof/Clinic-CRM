"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricCard } from "@/types/domain";

export function MetricGrid({ metrics }: { metrics: MetricCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <p className="text-sm text-slate-500">{metric.label}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold text-slate-950">{metric.value}</p>
            {metric.delta ? <p className="text-sm text-slate-500">{metric.delta}</p> : null}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function FilterBar({ filters }: { filters: string[] }) {
  const [activeFilter, setActiveFilter] = useState(filters[0] ?? "");

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
      {filters.map((filter) => (
        <button
          key={filter}
          className={cn(
            "rounded-md border px-3 py-2 text-sm transition",
            activeFilter === filter
              ? "border-primary-600 bg-primary-50 text-primary-700"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          )}
          onClick={() => setActiveFilter(filter)}
          type="button"
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export function PlaceholderChart({ title }: { title: string }) {
  return (
    <Card className="min-h-64">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-6 grid h-40 grid-cols-12 items-end gap-2 border-b border-l border-slate-200 pl-3">
        {[35, 58, 44, 72, 66, 82, 55, 76, 91, 63, 78, 88].map((height, index) => (
          <div key={index} className="rounded-t bg-primary-600/80" style={{ height: `${height}%` }} />
        ))}
      </div>
    </Card>
  );
}
