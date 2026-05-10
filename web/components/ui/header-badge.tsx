import { ReactNode } from "react"

interface HeaderBadgeProps {
  children: ReactNode
  variant?: "filled" | "outline"
  icon?: ReactNode
}

export default function HeaderBadge({
  children,
  variant = "filled",
  icon,
}: HeaderBadgeProps) {
  const styles =
    variant === "filled"
      ? {
          background: "rgba(74,144,217,0.10)",
          border: "1px solid rgba(74,144,217,0.20)",
          color: "#E8EEF8",
        }
      : {
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.14)",
          color: "#E8EEF8",
        }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 400,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        ...styles,
      }}
    >
      {icon}
      {children}
    </span>
  )
}
