import React, { PropsWithChildren } from "react";
import Link from "next/link";
import { GraduationCap, Sparkles } from "lucide-react";

const AuthLayout = ({ children }: PropsWithChildren) => {
	return (
		<div className="flex min-h-screen">
			{/* Left brand panel — hidden on small screens */}
			<aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary/5 p-10 lg:flex">
				{/* Background decorative element */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 -z-10"
				>
					<div className="absolute -left-32 -top-32 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
					<div className="absolute -bottom-32 -right-32 size-[400px] rounded-full bg-primary/15 blur-[100px]" />
				</div>

				{/* Logo */}
				<Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
					<GraduationCap className="size-8 text-primary" />
					<span className="text-xl font-bold tracking-tight">
						Educ<span className="text-primary">AI</span>
					</span>
				</Link>

				{/* Tagline */}
				<div className="max-w-md">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
						<Sparkles className="size-3.5 text-primary" />
						AI-Powered Education
					</div>
					<blockquote className="text-2xl font-semibold leading-snug tracking-tight">
						&ldquo;The beautiful thing about learning is that nobody can take it
						away from you.&rdquo;
					</blockquote>
					<p className="mt-3 text-sm text-muted-foreground">
						— B.B. King
					</p>
				</div>

				<p className="text-xs text-muted-foreground">
					&copy; {new Date().getFullYear()} EducAI. All rights reserved.
				</p>
			</aside>

			{/* Right form panel */}
			<main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
				{children}
			</main>
		</div>
	);
};

export default AuthLayout;
