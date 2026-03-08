import { getUserProfile } from "@/lib/auth/action";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ProfileEditForm from "./_components/ProfileEditForm";

export const metadata = { title: "Edit Profile · EducAI" };

export default async function ProfilePage() {
	const session = await getSession();
	if (!session) redirect("/auth/signin");

	const profile = await getUserProfile();

	return (
		<div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
				<p className="mt-1 text-muted-foreground">
					Update your academic background and preferences.
				</p>
			</div>
			<ProfileEditForm initialProfile={profile} />
		</div>
	);
}
