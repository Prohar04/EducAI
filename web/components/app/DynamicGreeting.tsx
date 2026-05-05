"use client";

function computeGreeting(hours: number): string {
  if (hours < 12) return "Good morning";
  if (hours < 17) return "Good afternoon";
  return "Good evening";
}

interface Props {
  name?: string | null;
}

export function DynamicGreeting({ name }: Props) {
  // Computed on the client — suppressHydrationWarning handles the
  // case where server clock differs from user's local time.
  const greeting = computeGreeting(new Date().getHours());

  return (
    <>
      <p suppressHydrationWarning className="text-sm font-medium text-muted-foreground">
        {greeting}
      </p>
      <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
        {name?.split(" ")[0] ?? "Your Study Plan"}
      </h1>
    </>
  );
}
