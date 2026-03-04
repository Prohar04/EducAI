"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/ui/submitButton";
import { resetPassword } from "@/lib/auth/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect } from "react";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<AuthCard><AuthHeader title="Loading…" description="" /></AuthCard>}>
			<ResetPasswordContent />
		</Suspense>
	);
}

function ResetPasswordContent() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token") || "";
	const [state, action] = useActionState(resetPassword, undefined);

	// Redirect to sign-in after successful reset
	useEffect(() => {
		if (state?.success) {
			const timer = setTimeout(() => {
				window.location.href = "/auth/signin";
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [state?.success]);

	if (!token) {
		return (
			<AuthCard>
				<AuthHeader
					title="Invalid Link"
					description="This password reset link is invalid or missing a token."
				/>
				<div className="mt-6 text-center">
					<Link
						href="/auth/forgot-password"
						className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
					>
						<ArrowLeft className="size-3.5" />
						Request a new reset link
					</Link>
				</div>
			</AuthCard>
		);
	}

	return (
		<AuthCard>
			<AuthHeader
				title="Set new password"
				description="Enter your new password below."
			/>

			<div className="mt-8">
				{/* Success message */}
				{state?.message && state?.success && (
					<div
						role="status"
						className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400"
					>
						<CheckCircle2 className="size-4 shrink-0" />
						{state.message}
					</div>
				)}

				{/* Error message */}
				{state?.message && !state?.success && (
					<div
						role="alert"
						className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
					>
						<AlertCircle className="size-4 shrink-0" />
						{state.message}
					</div>
				)}

				{!state?.success && (
					<form action={action} className="grid gap-4">
						{/* Hidden token field */}
						<input type="hidden" name="token" value={token} />

						{/* Password */}
						<div className="grid gap-1.5">
							<Label htmlFor="password">New Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="••••••••"
								autoComplete="new-password"
								required
								aria-describedby={
									state?.error?.password ? "password-error" : undefined
								}
								aria-invalid={!!state?.error?.password}
							/>
							{state?.error?.password && (
								<div
									id="password-error"
									className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
								>
									<p className="mb-1 font-medium">Password must:</p>
									<ul className="list-inside list-disc space-y-0.5">
										{state.error.password.map((error) => (
											<li key={error}>{error}</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* Confirm Password */}
						<div className="grid gap-1.5">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								placeholder="••••••••"
								autoComplete="new-password"
								required
								aria-describedby={
									state?.error?.confirmPassword
										? "confirm-password-error"
										: undefined
								}
								aria-invalid={!!state?.error?.confirmPassword}
							/>
							{state?.error?.confirmPassword && (
								<p
									id="confirm-password-error"
									className="text-xs text-destructive"
								>
									{state.error.confirmPassword}
								</p>
							)}
						</div>

						<SubmitButton>Reset Password</SubmitButton>
					</form>
				)}

				<div className="mt-6 text-center">
					<Link
						href="/auth/signin"
						className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
					>
						<ArrowLeft className="size-3.5" />
						Back to Sign In
					</Link>
				</div>
			</div>
		</AuthCard>
	);
}
