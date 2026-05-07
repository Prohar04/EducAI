import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/auth/action";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { Navbar } from "@/components/app/Navbar";
import { LazyChatbotWidget } from "@/components/app/LazyChatbotWidget";
import { TransitionLayout } from "@/components/motion/TransitionLayout";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const profile = await getUserProfile();
  if (!profile?.onboardingDone) redirect("/onboarding");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={session.user} />
      <main className="flex-1">
        <TransitionLayout>{children}</TransitionLayout>
      </main>
      <LazyChatbotWidget />
    </div>
  );
}
