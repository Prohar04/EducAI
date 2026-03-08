import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import type { ReactNode } from "react";
import { Navbar } from "@/components/app/Navbar";
import { ChatbotWidget } from "@/components/app/ChatbotWidget";
import { TransitionLayout } from "@/components/motion/TransitionLayout";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={session.user} />
      <main className="flex-1">
        <TransitionLayout>{children}</TransitionLayout>
      </main>
      <ChatbotWidget />
    </div>
  );
}
