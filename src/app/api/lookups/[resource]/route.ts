import { ok } from "@/lib/api-response";
import { branches, doctors, products, services, sources } from "@/data/mock";

type Context = {
  params: Promise<{ resource: string }>;
};

export async function GET(_: Request, context: Context) {
  const { resource } = await context.params;
  const lookups = {
    branches,
    doctors,
    services,
    products,
    sources
  };

  return ok(lookups[resource as keyof typeof lookups] ?? []);
}

