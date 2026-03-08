// This route is retired — redirect all visitors to the main dashboard
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/app");
}
