import type { Metadata } from "next";
import JobsClient from "./_components/JobsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Job Finder · EducAI" };

export default function JobsPage() {
  return <JobsClient />;
}
