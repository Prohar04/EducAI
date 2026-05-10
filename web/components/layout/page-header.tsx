"use client"

import dynamic from "next/dynamic"
import { ReactNode, memo } from "react"

const animationMap = {
  programs:     () => import("@/components/animations/programs-animation"),
  scholarships: () => import("@/components/animations/scholarships-animation"),
  timeline:     () => import("@/components/animations/timeline-animation"),
  strategy:     () => import("@/components/animations/strategy-animation"),
  sop:          () => import("@/components/animations/sop-animation"),
  cv:           () => import("@/components/animations/cv-animation"),
  professors:   () => import("@/components/animations/professors-animation"),
  "gap-fix":    () => import("@/components/animations/gap-fix-animation"),
  career:       () => import("@/components/animations/career-animation"),
  jobs:         () => import("@/components/animations/jobs-animation"),
  immigration:  () => import("@/components/animations/immigration-animation"),
  dashboard:    () => import("@/components/animations/dashboard-animation"),
} as const

const DynamicAnimations = {
  programs:     dynamic(animationMap.programs, { ssr: false, loading: () => null }),
  scholarships: dynamic(animationMap.scholarships, { ssr: false, loading: () => null }),
  timeline:     dynamic(animationMap.timeline, { ssr: false, loading: () => null }),
  strategy:     dynamic(animationMap.strategy, { ssr: false, loading: () => null }),
  sop:          dynamic(animationMap.sop, { ssr: false, loading: () => null }),
  cv:           dynamic(animationMap.cv, { ssr: false, loading: () => null }),
  professors:   dynamic(animationMap.professors, { ssr: false, loading: () => null }),
  "gap-fix":    dynamic(animationMap["gap-fix"], { ssr: false, loading: () => null }),
  career:       dynamic(animationMap.career, { ssr: false, loading: () => null }),
  jobs:         dynamic(animationMap.jobs, { ssr: false, loading: () => null }),
  immigration:  dynamic(animationMap.immigration, { ssr: false, loading: () => null }),
  dashboard:    dynamic(animationMap.dashboard, { ssr: false, loading: () => null }),
} as const

type AnimationKey = keyof typeof animationMap

interface PageHeaderProps {
  animation: AnimationKey
  title: ReactNode
  subtitle?: string
  badges?: ReactNode
  action?: ReactNode
  rightContent?: ReactNode
  metaText?: string
  centered?: boolean
  className?: string
}

const PageHeader = memo(function PageHeader({
  animation,
  title,
  subtitle,
  badges,
  action,
  rightContent,
  metaText,
  centered = false,
  className,
}: PageHeaderProps) {
  const Animation = DynamicAnimations[animation]

  const combined = rightContent ?? action

  return (
    <div
      className={className}
      style={{
        position: "relative",
        padding: "28px 0 20px",
        marginBottom: 24,
        overflow: "hidden",
        minHeight: 140,
      }}
    >
      {/* Animation — positioned right, never overlaps text */}
      <div
        aria-hidden="true"
        className="hidden md:block"
        style={{
          position: "absolute",
          right: -40,
          top: 0,
          bottom: 0,
          width: "42%",
          maxWidth: 520,
          opacity: 0.80,
          pointerEvents: "none",
          zIndex: 0,
          maskImage: "linear-gradient(to right, transparent 0%, black 35%, black 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 35%, black 100%)",
        }}
      >
        <Animation />
      </div>

      {/* Content layer — sits on top of animation */}
      <div
        className="page-header-content"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "55%",
          textAlign: centered ? "center" : "left",
          marginLeft: centered ? "auto" : 0,
          marginRight: centered ? "auto" : 0,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(22px, 3.2vw, 36px)",
            fontWeight: 700,
            color: "#E8EEF8",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            margin: 0,
            marginBottom: subtitle ? 10 : 0,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontSize: "clamp(13px, 1.3vw, 15px)",
              color: "#7A8BA8",
              fontWeight: 300,
              lineHeight: 1.6,
              margin: 0,
              marginBottom: badges ? 14 : 0,
            }}
          >
            {subtitle}
          </p>
        )}

        {badges && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              justifyContent: centered ? "center" : "flex-start",
            }}
          >
            {badges}
          </div>
        )}
      </div>

      {/* Gradient underline */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 16,
          height: 1,
          background: "linear-gradient(90deg, rgba(74,144,217,0.25) 0%, rgba(74,144,217,0) 60%)",
        }}
      />

      {/* Top-right meta text */}
      {metaText && !combined && (
        <div
          style={{
            position: "absolute",
            top: 32,
            right: 0,
            zIndex: 2,
            fontSize: 12,
            color: "#3D4F6B",
            fontWeight: 300,
          }}
        >
          {metaText}
        </div>
      )}

      {/* Right-side action/content */}
      {combined && (
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 0,
            zIndex: 2,
          }}
        >
          {combined}
        </div>
      )}
    </div>
  )
})

PageHeader.displayName = "PageHeader"
export { PageHeader }
export default PageHeader
