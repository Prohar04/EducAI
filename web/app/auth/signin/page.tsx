import React from "react";
import SignInForm from "./signupInFrom";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { OAuthButton } from "@/components/auth/OAuthButton";

const SignInPage = () => {
	return (
		<AuthCard>
			<AuthHeader
				title="Welcome back"
				description="Sign in to your EducAI account to continue learning."
			/>

			<div className="mt-8">
				<OAuthButton />
				<AuthDivider />
				<SignInForm />
			</div>
		</AuthCard>
	);
};

export default SignInPage;
