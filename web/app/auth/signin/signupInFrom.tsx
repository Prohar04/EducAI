"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/ui/submitButton";
import { signIn, resendVerification } from "@/lib/auth/auth";
import Link from "next/link";
import React, { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";

const SignInForm = () => {
	const [state, action] = useActionState(signIn, undefined);
	const [resendState, resendAction] = useActionState(
		resendVerification,
		undefined,
	);
	const [resendEmail, setResendEmail] = useState("");

	const isUnverified = state?.code === "EMAIL_NOT_VERIFIED";

	return (
		<form action={action} className="grid gap-4">
			{/* Server error */}
			{state?.message && !isUnverified && (
				<div
					role="alert"
					className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
				>
					<AlertCircle className="size-4 shrink-0" />
					{state.message}
				</div>
			)}

			{/* Email not verified banner */}
			{isUnverified && (
				<div className="space-y-3 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3">
					<div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
						<Mail className="size-4 shrink-0" />
						{state?.message}
					</div>
					{/* Inline resend form */}
					<form action={resendAction} className="flex items-center gap-2">
						<Input
							type="email"
							name="email"
							placeholder="your@email.com"
							value={resendEmail}
							onChange={(e) => setResendEmail(e.target.value)}
							className="h-8 text-xs"
							required
						/>
						<button
							type="submit"
							className="whitespace-nowrap rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
						>
							Resend
						</button>
					</form>
					{resendState?.message && (
						<div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
							<CheckCircle2 className="size-3" />
							{resendState.message}
						</div>
					)}
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
					aria-describedby={
						state?.error?.password ? "password-error" : undefined
					}
					aria-invalid={!!state?.error?.password}
				/>
				{state?.error?.password && (
					<p id="password-error" className="text-xs text-destructive">
						{state.error.password}
					</p>
				)}
			</div>

			{/* Remember me */}
			<div className="flex items-center gap-2">
				<input
					id="rememberMe"
					name="rememberMe"
					type="checkbox"
					className="size-4 rounded border-border accent-primary"
				/>
				<Label htmlFor="rememberMe" className="text-sm font-normal">
					Remember me
				</Label>
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
