"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  serviceId: string;
  name: string;
  qty: number;
  price: number;
};

type Lookup = { id: string; name: string; basePrice?: number };

export default function CreateInvoicePage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([
    { id: Math.random().toString(), serviceId: "", name: "", qty: 1, price: 0 },
  ]);
  const [patientId, setPatientId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [doctorId, setDoctorId] = useState("");

  const [patients, setPatients] = useState<Lookup[]>([]);
  const [branches, setBranches] = useState<Lookup[]>([]);
  const [doctors, setDoctors] = useState<Lookup[]>([]);
  const [services, setServices] = useState<Lookup[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetch("/api/lookups/patients")
      .then((res) => res.json())
      .then((d) => setPatients(d.data || []));
    fetch("/api/lookups/branches")
      .then((res) => res.json())
      .then((d) => setBranches(d.data || []));
    fetch("/api/lookups/doctors")
      .then((res) => res.json())
      .then((d) => setDoctors(d.data || []));
    fetch("/api/lookups/services")
      .then((res) => res.json())
      .then((d) => setServices(d.data || []));
  }, []);

  const addItem = () =>
    setItems([
      ...items,
      { id: Math.random().toString(), serviceId: "", name: "", qty: 1, price: 0 },
    ]);
  const removeItem = (id: string) =>
    setItems(items.filter((i) => i.id !== id));
  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const subtotal = items.reduce((acc, i) => acc + i.qty * i.price, 0);
  const total = subtotal;

  const handleIssue = async () => {
    if (!patientId || !branchId || items.some((i) => !i.name || i.price <= 0)) {
      setNotification({
        message: "Please fill all required fields and add valid items.",
        type: "error",
      });
      return;
    }
    setIsSaving(true);
    setNotification(null);
    try {
      const res = await fetch("/api/resources/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          branchId,
          doctorProfileId: doctorId || null,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.qty,
            unitPrice: i.price,
          })),
          totalAmount: total,
          subtotal,
          status: "ISSUED",
        }),
      });
      if (!res.ok) throw new Error("Failed to issue invoice");
      setNotification({ message: "Invoice issued successfully!", type: "success" });
      setTimeout(() => router.push("/clinic-admin/payments/invoices"), 1500);
    } catch (err: any) {
      setNotification({ message: err.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell
      role="CLINIC_ADMIN"
      title="Create Invoice"
      description="Generate a new invoice for patient services."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6">
          {notification && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-lg border p-4 ${
                notification.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">
                {notification.message}
              </span>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase mb-1 block">
                Patient
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase mb-1 block">
                Branch
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase mb-1 block">
                Doctor (Optional)
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_140px_40px] gap-3 bg-slate-50 p-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <span>Description</span>
              <span>Quantity</span>
              <span>Unit Price (UZS)</span>
              <span />
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_100px_140px_40px] gap-3 p-3 items-center"
                >
                  <select
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={item.serviceId}
                    onChange={(e) => {
                      const selected = services.find(
                        (s) => s.id === e.target.value
                      );
                      updateItem(item.id, "serviceId", e.target.value);
                      updateItem(item.id, "name", selected?.name || "");
                      if (selected?.basePrice)
                        updateItem(
                          item.id,
                          "price",
                          Number(selected.basePrice)
                        );
                    }}
                  >
                    <option value="">Select Service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "qty",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Line Item
            </Button>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                disabled={isSaving}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button onClick={handleIssue} disabled={isSaving}>
                {isSaving ? "Issuing..." : "Issue Invoice"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 h-fit">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Invoice Summary
          </h2>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-950">
                {subtotal.toLocaleString()} UZS
              </span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Discount</span>
              <span className="font-medium text-emerald-600">- 0 UZS</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <span className="text-base font-semibold text-slate-900">
                Total
              </span>
              <span className="text-lg font-bold text-primary-700">
                {total.toLocaleString()} UZS
              </span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
