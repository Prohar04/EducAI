"use client";

import { useState, useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/ui/submitButton";
import { signUp } from "@/lib/auth/auth";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import type { FormState } from "@/types/auth.type";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive mt-1">{errors[0]}</p>;
}

export default function SignUpForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signUp, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordMismatch = confirm.length > 0 && password !== confirm;

  const err = state?.error ?? {};

  return (
    <form action={action} className="grid gap-4">
      {state?.message && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.message}
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Jane Doe"
          autoComplete="name"
          required
        />
        <FieldError errors={err.name} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <FieldError errors={err.email} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "#7A8BA8", display: "flex", alignItems: "center",
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Min 8 chars, include a number and special character.</p>
        <FieldError errors={err.password} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={{ paddingRight: 40, borderColor: passwordMismatch ? "var(--destructive)" : undefined }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "#7A8BA8", display: "flex", alignItems: "center",
            }}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordMismatch && <p className="text-xs text-destructive">Passwords do not match.</p>}
      </div>

      <SubmitButton disabled={pending || passwordMismatch} className="w-full">
        Create Account
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/80">Sign In</Link>
      </p>
      <p style={{ textAlign: "center", fontSize: 11, color: "#3D4F6B", marginTop: 4 }}>
        By creating an account, you agree to our{" "}
        <Link href="/terms" style={{ color: "#7A8BA8", textDecoration: "underline" }}>Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" style={{ color: "#7A8BA8", textDecoration: "underline" }}>Privacy Policy</Link>
      </p>
    </form>
  );
}
