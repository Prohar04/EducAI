"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/ui/submitButton";
import { signIn } from "@/lib/auth/auth";
import Link from "next/link";
import React, { useActionState } from "react";
import { AlertCircle } from "lucide-react";

const SignInForm = () => {
	const [state, action] = useActionState(signIn, undefined);

	return (
		<form action={action} className="grid gap-4">
			{/* Server error */}
			{state?.message && (
				<div
					role="alert"
					className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
				>
					<AlertCircle className="size-4 shrink-0" />
					{state.message}
				</div>
			)}

			{/* Email */}
			<div className="grid gap-1.5">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="you@example.com"
					autoComplete="email"
					required
					aria-describedby={state?.error?.email ? "email-error" : undefined}
					aria-invalid={!!state?.error?.email}
				/>
				{state?.error?.email && (
					<p id="email-error" className="text-xs text-destructive">
						{state.error.email}
					</p>
				)}
			</div>

			{/* Password */}
			<div className="grid gap-1.5">
				<div className="flex items-center justify-between">
					<Label htmlFor="password">Password</Label>
					<Link
						href="/auth/forgot-password"
						className="text-xs text-muted-foreground transition-colors hover:text-primary"
					>
						Forgot password?
					</Link>
				</div>
				<Input
					id="password"
					name="password"
					type="password"
					placeholder="••••••••"
					autoComplete="current-password"
					required
					aria-describedby={state?.error?.password ? "password-error" : undefined}
					aria-invalid={!!state?.error?.password}
				/>
				{state?.error?.password && (
					<p id="password-error" className="text-xs text-destructive">
						{state.error.password}
					</p>
				)}
			</div>

			<SubmitButton>Sign In</SubmitButton>

			<p className="text-center text-sm text-muted-foreground">
				Don&apos;t have an account?{" "}
				<Link
					href="/auth/signup"
					className="font-medium text-primary transition-colors hover:text-primary/80"
				>
					Sign Up
				</Link>
			</p>
		</form>
	);
};

export default SignInForm;
