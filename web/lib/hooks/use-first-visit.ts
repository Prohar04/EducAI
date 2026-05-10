"use client"
import { useEffect, useState } from "react"

export function useFirstVisit(key: string): boolean {
  const [isFirst, setIsFirst] = useState(false)

  useEffect(() => {
    const storageKey = `educai:visited:${key}`
    const visited = sessionStorage.getItem(storageKey)
    if (!visited) {
      setIsFirst(true)
      sessionStorage.setItem(storageKey, "1")
    }
  }, [key])

  return isFirst
}
