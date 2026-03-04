import React from "react";
import SignUpForm from "./SignUpFrom";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { OAuthButton } from "@/components/auth/OAuthButton";

const SignUpPage = () => {
	return (
		<AuthCard>
			<AuthHeader
				title="Create an account"
				description="Start your AI-powered learning journey today."
			/>

			<div className="mt-8">
				<OAuthButton />
				<AuthDivider />
				<SignUpForm />
			</div>
		</AuthCard>
	);
};

export default SignUpPage;
