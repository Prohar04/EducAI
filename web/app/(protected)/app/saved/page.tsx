import SavedProgramsClient from "./_components/SavedProgramsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved Programs · EducAI",
  description: "Your bookmarked university programs",
};

export default function SavedProgramsPage() {
  return <SavedProgramsClient />;
}
