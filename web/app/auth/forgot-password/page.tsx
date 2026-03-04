"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/ui/submitButton";
import { requestPasswordReset } from "@/lib/auth/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
	const [state, action] = useActionState(requestPasswordReset, undefined);

	// Determine if the message is a success message (contains "sent")
	const isSuccess = state?.message?.toLowerCase().includes("sent");

	return (
		<AuthCard>
			<AuthHeader
				title="Forgot password?"
				description="Enter your email and we'll send you a link to reset your password."
			/>

			<div className="mt-8">
				{/* Success message */}
				{state?.message && isSuccess && (
					<div
						role="status"
						className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400"
					>
						<CheckCircle2 className="size-4 shrink-0" />
						{state.message}
					</div>
				)}

				{/* Error message */}
				{state?.message && !isSuccess && (
					<div
						role="alert"
						className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
					>
						<AlertCircle className="size-4 shrink-0" />
						{state.message}
					</div>
				)}

				<form action={action} className="grid gap-4">
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
							aria-describedby={
								state?.error?.email ? "email-error" : undefined
							}
							aria-invalid={!!state?.error?.email}
						/>
						{state?.error?.email && (
							<p id="email-error" className="text-xs text-destructive">
								{state.error.email}
							</p>
						)}
					</div>

					<SubmitButton>Send Reset Link</SubmitButton>
				</form>

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
