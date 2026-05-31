import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionOrNull } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/auth/action";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { Navbar } from "@/components/app/Navbar";
import { LazyChatbotWidget } from "@/components/app/LazyChatbotWidget";
import { TransitionLayout } from "@/components/motion/TransitionLayout";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // Use getSessionOrNull to avoid premature redirects during cookie read
  const session = await getSessionOrNull();

  // Only redirect if session is genuinely null (not loading, not temporary failure)
  if (!session) {
    // Could be loading or genuinely unauthenticated
    // Give one more try with a small delay to handle transient cookie read issues
    await new Promise(resolve => setTimeout(resolve, 100));
    const retrySession = await getSessionOrNull();

    if (!retrySession) {
      redirect("/auth/signin?reason=session_expired");
    }

    // Use the retry session
    const profile = await getUserProfile();
    if (!profile?.onboardingDone) redirect("/onboarding");

    return (
      <div className="flex min-h-[100svh] flex-col bg-background">
        <Navbar user={retrySession.user} />
        <main className="flex-1 min-h-0">
          <TransitionLayout>{children}</TransitionLayout>
        </main>
        <LazyChatbotWidget />
      </div>
    );
  }

  const profile = await getUserProfile();
  if (!profile?.onboardingDone) redirect("/onboarding");

  return (
    <div className="flex min-h-[100svh] flex-col bg-background">
      <Navbar user={session.user} />
      <main className="flex-1 min-h-0">
        <TransitionLayout>{children}</TransitionLayout>
      </main>
      <LazyChatbotWidget />
    </div>
  );
}
