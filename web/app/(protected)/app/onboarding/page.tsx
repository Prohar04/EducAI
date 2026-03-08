// Onboarding wizard has moved to the profile edit page
import { redirect } from "next/navigation";

export default function OnboardingPage() {
  redirect("/app/profile");
}
