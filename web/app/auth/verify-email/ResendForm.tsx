"use client";

import { useActionState } from "react";
import { resendVerification } from "@/lib/auth/auth";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/ui/submitButton";
import { CheckCircle2 } from "lucide-react";

export default function ResendForm() {
	const [resendState, resendAction] = useActionState(
		resendVerification,
		undefined,
	);

	return (
		<>
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
		</>
	);
}
