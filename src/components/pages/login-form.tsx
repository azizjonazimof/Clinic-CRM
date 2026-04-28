"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

export function LoginForm() {
  const [email, setEmail] = useState("super@medcrm.local");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json();

      if (!response.ok || payload.error) {
        setError(payload.error?.message ?? "Login failed.");
        return;
      }

      window.location.href = payload.data.redirectTo;
    } catch {
      setError("Unable to reach the login service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      <label className="block text-sm font-medium text-slate-700">
        Email
        <Input className="mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <Input className="mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
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
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}

