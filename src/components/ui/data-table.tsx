"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type DataTableProps<T extends object> = {
  title: string;
  description?: string;
  columns: { key: keyof T | string; label: string }[];
  rows: T[];
  actions?: React.ReactNode;
  onEdit?: (row: T) => void;
};

export function DataTable<T extends object>({ title, description, columns, rows, actions, onEdit }: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      Object.values(row as Record<string, unknown>).some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [rows, search]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-9 sm:w-64" onChange={(event) => setSearch(event.target.value)} placeholder="Search" value={search} />
          </div>
          {actions}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-600">
                  {column.label}
                </th>
              ))}
              {onEdit && <th className="w-10 bg-slate-50"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.length ? (
              filteredRows.map((row, index) => {
                const record = row as Record<string, unknown>;
                return (
                  <tr key={String(record.id ?? index)} className="hover:bg-slate-50">
                    {columns.map((column) => (
                      <td key={String(column.key)} className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {String(record[String(column.key)] ?? "")}
                      </td>
                    ))}
                    {onEdit && (
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button 
                          onClick={() => onEdit(row)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
        <span>Page 1 of 1</span>
        <span>{filteredRows.length} records</span>
      </div>
    </section>
  );
}
