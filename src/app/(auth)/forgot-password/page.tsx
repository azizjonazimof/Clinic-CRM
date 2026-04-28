import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-slate-950">Reset access</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your email and we will send a password reset link.</p>
        <form className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <Input className="mt-1" type="email" placeholder="you@clinic.com" />
          </label>
          <Button className="w-full" type="submit">
            Send reset link
          </Button>
        </form>
        <Link className="mt-4 block text-sm font-medium text-primary-700" href={routes.auth.login}>
          Back to login
        </Link>
      </Card>
    </main>
  );
}

