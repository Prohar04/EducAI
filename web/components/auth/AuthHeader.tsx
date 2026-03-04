import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  description?: string;
}

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Link href="/" className="mb-2 flex items-center gap-2" aria-label="Go to homepage">
        <GraduationCap className="size-8 text-primary" />
        <span className="text-xl font-bold tracking-tight">
          Educ<span className="text-primary">AI</span>
        </span>
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
