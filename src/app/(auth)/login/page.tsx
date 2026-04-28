import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-slate-950">Medical CRM Login</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to continue to your role dashboard.</p>
        <form className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <Input className="mt-1" type="email" placeholder="admin@clinic.com" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <Input className="mt-1" type="password" placeholder="Password" />
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
              Remember me
            </label>
            <Link className="font-medium text-primary-700" href={routes.auth.forgotPassword}>
              Forgot password?
            </Link>
          </div>
          <Button className="w-full" type="submit">
            Login
          </Button>
        </form>
      </Card>
    </main>
  );
}
