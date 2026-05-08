import { cn } from "@/lib/utils";

interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function DefaultIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="39" stroke="rgba(74,144,217,0.2)" strokeWidth="1" />
      <circle cx="40" cy="40" r="26" stroke="rgba(74,144,217,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="40" cy="40" r="8" fill="rgba(74,144,217,0.15)" stroke="rgba(74,144,217,0.4)" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="3" fill="#4A90D9" />
    </svg>
  );
}

export function EmptyState({ illustration, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-5 flex h-[120px] w-[120px] items-center justify-center">
        {illustration ?? <DefaultIllustration />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
