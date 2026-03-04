"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/ui/submitButton";
import { signUp } from "@/lib/auth/auth";
import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

const SignUpForm = () => {
	const [state, action] = useActionState(signUp, undefined);

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

			{/* Name */}
			<div className="grid gap-1.5">
				<Label htmlFor="name">Full Name</Label>
				<Input
					id="name"
					name="name"
					placeholder="John Doe"
					autoComplete="name"
					required
					aria-describedby={state?.error?.name ? "name-error" : undefined}
					aria-invalid={!!state?.error?.name}
				/>
				{state?.error?.name && (
					<p id="name-error" className="text-xs text-destructive">
						{state.error.name}
					</p>
				)}
			</div>

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
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					name="password"
					type="password"
					placeholder="••••••••"
					autoComplete="new-password"
					required
					aria-describedby={state?.error?.password ? "password-error" : undefined}
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

			<SubmitButton>Create Account</SubmitButton>

			<p className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link
					href="/auth/signin"
					className="font-medium text-primary transition-colors hover:text-primary/80"
				>
					Sign In
				</Link>
			</p>
		</form>
	);
};

export default SignUpForm;
