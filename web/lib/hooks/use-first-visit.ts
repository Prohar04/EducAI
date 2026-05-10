"use client"
import { useEffect, useState } from "react"

export function useFirstVisit(key: string): boolean {
  const storageKey = `educai:visited:${key}`

  const [isFirst] = useState(() => {
    try {
      if (typeof window === "undefined") return false
      const visited = sessionStorage.getItem(storageKey)
      if (!visited) {
        sessionStorage.setItem(storageKey, "1")
        return true
      }
      return false
    } catch {
      return false
    }
  })

  return isFirst
}
