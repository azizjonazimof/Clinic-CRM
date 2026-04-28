import { ok } from "@/lib/api-response";

export function GET() {
  return ok({
    status: "ok",
    service: "medical-crm",
    timestamp: new Date().toISOString()
  });
}

