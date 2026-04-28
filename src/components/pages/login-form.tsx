"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

export function LoginForm() {
  const [email, setEmail] = useState("super@medcrm.local");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  function updateCapsLock(event: React.KeyboardEvent<HTMLInputElement>) {
    setCapsLockOn(event.getModifierState("CapsLock"));
  }

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
        <div className="relative mt-1">
          <Input
            className="pr-11"
            type={showPassword ? "text" : "password"}
            value={password}
            onBlur={() => setCapsLockOn(false)}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={updateCapsLock}
            onKeyUp={updateCapsLock}
            required
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {capsLockOn ? <span className="mt-2 block text-xs font-medium text-amber-700">Caps Lock is on</span> : null}
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
