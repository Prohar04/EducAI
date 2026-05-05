"use client";

import { useEffect, useState } from "react";

function computeGreeting(hours: number): string {
  if (hours < 12) return "Good morning";
  if (hours < 17) return "Good afternoon";
  if (hours < 21) return "Good evening";
  return "Good evening";
}

interface Props {
  name?: string | null;
}

export function DynamicGreeting({ name }: Props) {
  const [greeting, setGreeting] = useState<string>("Welcome");

  useEffect(() => {
    setGreeting(computeGreeting(new Date().getHours()));
  }, []);

  return (
    <>
      <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
      <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
        {name?.split(" ")[0] ?? "Your Study Plan"}
      </h1>
    </>
  );
}
