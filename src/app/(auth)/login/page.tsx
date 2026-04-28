import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/pages/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-slate-950">Medical CRM Login</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to continue to your role dashboard.</p>
        <LoginForm />
      </Card>
    </main>
  );
}
