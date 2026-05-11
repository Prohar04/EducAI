"use client"
import { useState, useCallback, useRef } from "react"

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

interface UseDocumentPreviewOptions {
  endpoint: string
  template: string
}

export function useDocumentPreview({ endpoint, template }: UseDocumentPreviewOptions) {
  const [preview, setPreview] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API = process.env.NEXT_PUBLIC_BACKEND_URL || ""

  const generateRef = useRef(
    debounce(async (inputs: Record<string, unknown>, ep: string, tmpl: string, apiBase: string) => {
      setGenerating(true)
      setError(null)
      try {
        const res = await fetch(`${apiBase}${ep}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...inputs, template: tmpl, preview_mode: true }),
        })
        if (!res.ok) throw new Error("Generation failed")
        const data = await res.json()
        setPreview(data.content || data.text || data.sop || data.cv || "")
      } catch (e) {
        setError(String(e))
      } finally {
        setGenerating(false)
      }
    }, 800)
  )

  const generate = useCallback(
    (inputs: Record<string, unknown>) => {
      generateRef.current(inputs, endpoint, template, API)
    },
    [endpoint, template, API]
  )

  return { preview, generating, error, generate }
}
