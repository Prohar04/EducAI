import { getUserProfile } from "@/lib/auth/action";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileEditForm from "./_components/ProfileEditForm";
import DangerZone from "./_components/DangerZone";

export const metadata = { title: "Edit Profile · EducAI" };

export default async function ProfilePage() {
	const session = await getSession();
	if (!session) redirect("/auth/signin");

	const profile = await getUserProfile();

	return (
		<div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
			<div className="mb-6 sm:mb-8">
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit Profile</h1>
				<p className="mt-1 text-muted-foreground">
					Update your academic background and preferences.
				</p>
			</div>
			<ProfileEditForm initialProfile={profile} />

			{/* Account actions */}
			<div className="mt-10 space-y-3 rounded-xl border border-border bg-card p-5">
				<h2 className="text-sm font-semibold">Account</h2>
				<div className="flex flex-wrap gap-3">
					<a
						href="/api/auth/export-data"
						className="text-sm text-primary hover:underline"
					>
						Export my data (JSON)
					</a>
					<span className="text-muted-foreground/30">·</span>
					<Link href="/pricing" className="text-sm text-primary hover:underline">
						Pricing
					</Link>
				</div>
			</div>

			<DangerZone />
		</div>
	);
}
