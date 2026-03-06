"use client";

import { Suspense, useActionState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/ui/submitButton";
import { verifyEmail, resendVerification } from "@/lib/auth/auth";
import {
	CheckCircle2,
	AlertCircle,
	ArrowLeft,
	Mail,
} from "lucide-react";
import type { VerifyEmailFormState } from "@/types/auth.type";

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<AuthCard>
					<AuthHeader title="Verifying…" description="Please wait while we verify your email." />
				</AuthCard>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}

// Cache verification promises so React `use()` can suspend properly.
const verifyCache = new Map<string, Promise<VerifyEmailFormState>>();
function getVerifyPromise(token: string) {
	if (!verifyCache.has(token)) {
		verifyCache.set(token, verifyEmail(token));
	}
	return verifyCache.get(token)!;
}

function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const pending = searchParams.get("pending") === "true";

	// If there is a token, verify eagerly via React 19 `use()`
	const result: VerifyEmailFormState = token
		? use(getVerifyPromise(token))
		: undefined;

	const [resendState, resendAction] = useActionState(
		resendVerification,
		undefined,
	);

	// ── Pending state — user just signed up ──────────────────────────
	if (pending && !token) {
		return (
			<AuthCard>
				<AuthHeader
					title="Check your email"
					description="We sent a verification link to your email address. Click it to activate your account."
				/>
				<div className="mt-8 space-y-4">
					<div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
						<Mail className="size-5 shrink-0" />
						<span>
							Didn&apos;t receive the email? Enter your address below to
							resend.
						</span>
					</div>

					{resendState?.message && (
						<div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
							<CheckCircle2 className="size-4 shrink-0" />
							{resendState.message}
						</div>
					)}

					<form action={resendAction} className="grid gap-3">
						<Input
							type="email"
							name="email"
							placeholder="you@example.com"
							autoComplete="email"
							required
						/>
						<SubmitButton>Resend Verification Email</SubmitButton>
					</form>

					<div className="text-center">
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

	// ── Success ──────────────────────────────────────────────────────
	if (result?.success) {
		return (
			<AuthCard>
				<AuthHeader
					title="Email verified!"
					description="Your email has been verified. You can now sign in."
				/>
				<div className="mt-8 space-y-4">
					<div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
						<CheckCircle2 className="size-4 shrink-0" />
						{result.message}
					</div>
					<div className="text-center">
						<Link
							href="/auth/signin"
							className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
						>
							Go to Sign In
						</Link>
					</div>
				</div>
			</AuthCard>
		);
	}

	// ── Error / expired ──────────────────────────────────────────────
	return (
		<AuthCard>
			<AuthHeader
				title="Verification failed"
				description="The verification link is invalid or has expired."
			/>
			<div className="mt-8 space-y-4">
				{result?.message && (
					<div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
						<AlertCircle className="size-4 shrink-0" />
						{result.message}
					</div>
				)}

				<p className="text-sm text-muted-foreground">
					Enter your email to receive a new verification link.
				</p>

				{resendState?.message && (
					<div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
						<CheckCircle2 className="size-4 shrink-0" />
						{resendState.message}
					</div>
				)}

				<form action={resendAction} className="grid gap-3">
					<Input
						type="email"
						name="email"
						placeholder="you@example.com"
						autoComplete="email"
						required
					/>
					<SubmitButton>Resend Verification Email</SubmitButton>
				</form>

				<div className="text-center">
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
