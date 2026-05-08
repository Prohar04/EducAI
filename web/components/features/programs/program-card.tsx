"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { generateAvatarColor } from "@/lib/utils/generate-avatar-color";
import { Bookmark, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramCardProps {
  id: string;
  title: string;
  university: string;
  country: string;
  countryFlag?: string;
  fitScore?: number;
  admissionBand?: "reach" | "match" | "safety";
  gpa?: string;
  ielts?: string;
  deadline?: string;
  saved?: boolean;
  onSave?: (id: string) => void;
  className?: string;
}

const bandVariant = {
  reach: "danger" as const,
  match: "warning" as const,
  safety: "success" as const,
};

const bandLabel = {
  reach: "Reach",
  match: "Match",
  safety: "Safety",
};

export function ProgramCard({
  id,
  title,
  university,
  country,
  countryFlag,
  fitScore,
  admissionBand,
  gpa,
  ielts,
  deadline,
  saved = false,
  onSave,
  className,
}: ProgramCardProps) {
  const reduced = useReducedMotion();
  const avatarColor = generateAvatarColor(university);
  const initials = university.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 24px rgba(74,144,217,0.08)" }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[rgba(13,22,37,0.65)] backdrop-blur-xl p-5",
        "hover:border-[rgba(74,144,217,0.20)] transition-colors duration-300",
        className
      )}
    >
      {/* Fit score bar */}
      {fitScore !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Fit score</span>
            <GradientText className="text-sm font-bold">{fitScore}%</GradientText>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #4A90D9, #B8CCE8)" }}
              initial={reduced ? false : { scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: fitScore / 100 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* University info */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary/90 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {university} · {countryFlag} {country}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSave?.(id)}
          aria-label={saved ? "Remove from saved" : "Save program"}
          className={cn(
            "shrink-0 p-1 rounded-md transition-colors",
            saved ? "text-primary" : "text-muted-foreground/40 hover:text-primary"
          )}
        >
          <Bookmark className={cn("size-4", saved && "fill-current")} aria-hidden="true" />
        </button>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {admissionBand && (
          <StatusBadge variant={bandVariant[admissionBand]} dot>
            {bandLabel[admissionBand]}
          </StatusBadge>
        )}
        {gpa && <StatusBadge variant="muted">GPA {gpa}</StatusBadge>}
        {ielts && <StatusBadge variant="muted">IELTS {ielts}</StatusBadge>}
        {deadline && <StatusBadge variant="muted">{deadline}</StatusBadge>}
      </div>

      {/* Action */}
      <Link
        href={`/app/programs/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/70 hover:text-primary transition-colors group/link"
      >
        View details
        <ExternalLink className="size-3 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}
