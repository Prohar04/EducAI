import { verifyEmail } from "@/lib/auth/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import Link from "next/link";
import {
	CheckCircle2,
	AlertCircle,
	ArrowLeft,
	Mail,
} from "lucide-react";
import ResendForm from "./ResendForm";

export default async function VerifyEmailPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string; pending?: string }>;
}) {
	const { token, pending: pendingParam } = await searchParams;
	const pending = pendingParam === "true";

	let result = undefined;
	if (token) {
		result = await verifyEmail(token);
	}

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

					<ResendForm />

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

				<ResendForm />

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
