import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary/12 text-primary border-primary/20",
  success: "bg-[#3D9970]/12 text-[#3D9970] border-[#3D9970]/20",
  warning: "bg-[#C49A3C]/12 text-[#C49A3C] border-[#C49A3C]/20",
  danger: "bg-[#C0392B]/12 text-[#C0392B] border-[#C0392B]/20",
  info: "bg-[#4A90D9]/12 text-[#4A90D9] border-[#4A90D9]/20",
  muted: "bg-white/[0.04] text-muted-foreground border-white/[0.06]",
};

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ children, variant = "default", className, dot = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
