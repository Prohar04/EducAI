"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StatusBadge } from "@/components/shared/status-badge";
import { generateAvatarColor } from "@/lib/utils/generate-avatar-color";
import { MapPin, DollarSign, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobCardProps {
  id?: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  jobType?: string;
  postedAt?: string;
  url?: string;
  source?: string;
  className?: string;
}

export function JobCard({
  title,
  company,
  location,
  salary,
  jobType,
  postedAt,
  url,
  source,
  className,
}: JobCardProps) {
  const reduced = useReducedMotion();
  const avatarColor = generateAvatarColor(company);
  const initials = company.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const content = (
    <motion.div
      whileHover={reduced ? undefined : { y: -2, boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4",
        "hover:border-[rgba(99,102,241,0.25)] transition-colors duration-300",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary/90 transition-colors">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{company}</p>
        </div>
        {url && (
          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" aria-hidden="true" />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {location && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" aria-hidden="true" />
            {location}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="size-3" aria-hidden="true" />
            {salary}
          </span>
        )}
        {postedAt && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" aria-hidden="true" />
            {postedAt}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {jobType && <StatusBadge variant="default">{jobType}</StatusBadge>}
        {source && <StatusBadge variant="muted">{source}</StatusBadge>}
      </div>
    </motion.div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
