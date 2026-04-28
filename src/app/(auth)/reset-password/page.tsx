import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-slate-950">Create new password</h1>
        <p className="mt-2 text-sm text-slate-500">Use at least 8 characters with letters and numbers.</p>
        <form className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            New password
            <Input className="mt-1" type="password" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirm password
            <Input className="mt-1" type="password" />
          </label>
          <Button className="w-full" type="submit">
            Save password
          </Button>
        </form>
        <Link className="mt-4 block text-sm font-medium text-primary-700" href={routes.auth.login}>
          Back to login
        </Link>
      </Card>
    </main>
  );
}

