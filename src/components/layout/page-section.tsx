import { Card } from "@/components/ui/card";
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
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
      {filters.map((filter) => (
        <button key={filter} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
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

