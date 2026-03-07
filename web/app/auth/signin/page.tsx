import React from "react";
import SignInForm from "./signupInFrom";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { AlertCircle } from "lucide-react";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
	invalid_token: "Google sign-in failed. Please try again.",
	oauth_failed: "Google sign-in could not complete. Please try again.",
	oauth_expired: "Google sign-in timed out. Please try again.",
	oauth_server: "Server error during sign-in. Please try again shortly.",
};

type SignInPageProps = {
	searchParams: Promise<{ error?: string }>;
};

const SignInPage = async ({ searchParams }: SignInPageProps) => {
	const { error } = await searchParams;
	const errorMessage = error ? (OAUTH_ERROR_MESSAGES[error] ?? "An error occurred. Please try again.") : null;

	return (
		<AuthCard>
			<AuthHeader
				title="Welcome back"
				description="Sign in to your EducAI account to continue learning."
			/>

			<div className="mt-8">
				{errorMessage && (
					<div
						role="alert"
						className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
					>
						<AlertCircle className="size-4 shrink-0" />
						{errorMessage}
					</div>
				)}
				<OAuthButton />
				<AuthDivider />
				<SignInForm />
			</div>
		</AuthCard>
	);
};

export default SignInPage;
