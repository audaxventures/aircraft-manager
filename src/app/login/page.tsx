"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Plane, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FEATURES = [
  { title: "Centralize your data", description: "All operations in one place" },
  { title: "Reduce costs", description: "Make data-driven decisions" },
  { title: "Stay compliant", description: "Built for audit readiness" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Incorrect email or passphrase.");
      return;
    }
    router.push(searchParams.get("callbackUrl") ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="username"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 pl-10"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Passphrase</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your passphrase"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pr-10 pl-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide passphrase" : "Show passphrase"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="h-11 w-full rounded-xl text-base font-semibold" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col lg:grid lg:grid-cols-2">
      <div className="relative h-72 shrink-0 overflow-hidden sm:h-96 lg:h-auto">
        <Image
          src="/images/login-background.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/40" />
        <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-8 lg:p-12">
          <div className="mb-3 h-1 w-12 rounded-full bg-primary lg:mb-5" />
          <h2 className="max-w-md text-2xl leading-tight font-bold text-balance sm:text-3xl lg:text-4xl">
            Smarter Aircraft Operations. Lower Costs. Greater Control.
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/80 sm:text-base lg:mt-4">
            C-FPFX Operations is the all-in-one platform for managing your aircraft operations, including costs,
            trips, maintenance, and compliance — so you can focus on what matters most.
          </p>
          <div className="mt-5 flex gap-4 border-t border-white/20 pt-4 text-xs sm:gap-8 sm:text-sm lg:mt-8 lg:pt-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={cn(i > 0 && "border-l border-white/20 pl-4 sm:pl-8")}>
                <div className="font-semibold">{f.title}</div>
                <div className="text-white/70">{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-4 py-8 lg:py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Plane className="size-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">C-FPFX Operations</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage costs, trips, and compliance.</p>
          </div>
          <React.Suspense fallback={null}>
            <LoginForm />
          </React.Suspense>
          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <Plane className="size-4 rotate-45 text-muted-foreground/40" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">A smarter way to manage your aircraft operation.</p>
        </div>
      </div>
    </div>
  );
}
