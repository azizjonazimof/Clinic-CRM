import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CreateInvoicePage() {
  return (
    <AppShell role="CLINIC_ADMIN" title="Create Invoice" description="Create an invoice with patient, doctor, services, products, discounts, and totals.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Input placeholder="Select patient" />
            <Input placeholder="Select branch" />
            <Input placeholder="Select doctor" />
          </div>
          <div className="mt-5 rounded-lg border border-slate-200">
            <div className="grid grid-cols-[1fr_100px_120px_40px] gap-3 border-b border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span />
            </div>
            {[1, 2].map((item) => (
              <div key={item} className="grid grid-cols-[1fr_100px_120px_40px] gap-3 border-b border-slate-100 p-3">
                <Input placeholder="Service or product" />
                <Input placeholder="1" />
                <Input placeholder="$0.00" />
                <Button variant="ghost" aria-label="Remove item">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <Button variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add item
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary">Save draft</Button>
              <Button>Issue invoice</Button>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-900">Totals</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>$0.00</dd></div>
            <div className="flex justify-between"><dt>Discount</dt><dd>$0.00</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd>$0.00</dd></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold"><dt>Total</dt><dd>$0.00</dd></div>
          </dl>
        </Card>
      </div>
    </AppShell>
  );
}

