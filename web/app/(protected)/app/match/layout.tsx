import type { Metadata } from "next";

// The page itself is a client component and cannot export metadata, so the
// title lives on this server layout. The root template appends " · EducAI".
export const metadata: Metadata = { title: "AI Match" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
