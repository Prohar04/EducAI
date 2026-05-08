"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { StatusBadge } from "@/components/shared/status-badge";
import { generateAvatarColor } from "@/lib/utils/generate-avatar-color";
import { Calendar, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScholarshipCardProps {
  id: string;
  name: string;
  provider: string;
  amount?: string;
  eligibility?: "eligible" | "partial" | "not_eligible";
  deadline?: string;
  daysLeft?: number;
  className?: string;
}

const eligibilityConfig = {
  eligible: { variant: "success" as const, label: "Eligible" },
  partial: { variant: "warning" as const, label: "Partial" },
  not_eligible: { variant: "muted" as const, label: "Not eligible" },
};

export function ScholarshipCard({
  id,
  name,
  provider,
  amount,
  eligibility,
  deadline,
  daysLeft,
  className,
}: ScholarshipCardProps) {
  const reduced = useReducedMotion();
  const avatarColor = generateAvatarColor(provider);
  const initials = provider.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const isUrgent = daysLeft !== undefined && daysLeft < 7;
  const isSoon = daysLeft !== undefined && daysLeft < 30;

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -3, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white/[0.03] backdrop-blur-xl p-5",
        isUrgent
          ? "border-rose-500/30 animate-[pulse-border_2s_ease-in-out_infinite]"
          : "border-white/[0.08] hover:border-[rgba(99,102,241,0.25)]",
        "transition-colors duration-300",
        className
      )}
    >
      {/* Provider */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{provider}</p>
        </div>
      </div>

      {/* Amount */}
      {amount && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
          <span className="text-xs font-bold text-emerald-400">{amount}</span>
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {eligibility && (
          <StatusBadge variant={eligibilityConfig[eligibility].variant} dot>
            {eligibilityConfig[eligibility].label}
          </StatusBadge>
        )}
        {deadline && (
          <StatusBadge
            variant={isUrgent ? "danger" : isSoon ? "warning" : "muted"}
            dot={isUrgent || isSoon}
          >
            <Calendar className="size-3" aria-hidden="true" />
            {daysLeft !== undefined ? `${daysLeft}d left` : deadline}
          </StatusBadge>
        )}
      </div>

      <Link
        href={`/app/scholarships/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/70 hover:text-primary transition-colors group/link"
      >
        Check eligibility
        <ExternalLink className="size-3 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}
