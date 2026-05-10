export const FORBIDDEN_HALLUCINATION_PHRASES = [
  "lorem ipsum",
  "example.com",
  "john doe",
  "jane doe",
  "test@test.com",
  "placeholder",
  "[insert ",
  "[redacted]",
  "as an ai",
  "i cannot",
  "i'm sorry, but",
  "i apologize, but",
]

export function validateAIResponse<T extends Record<string, unknown>>(
  response: T,
  rules: {
    required: (keyof T)[]
    forbidden_strings?: string[]
  }
): { valid: boolean; reason?: string } {
  for (const field of rules.required) {
    if (response[field] == null) {
      return { valid: false, reason: `Missing required field: ${String(field)}` }
    }
  }

  const json = JSON.stringify(response).toLowerCase()
  const forbidden = rules.forbidden_strings ?? FORBIDDEN_HALLUCINATION_PHRASES

  for (const phrase of forbidden) {
    if (json.includes(phrase.toLowerCase())) {
      return { valid: false, reason: `Contains forbidden phrase: ${phrase}` }
    }
  }

  return { valid: true }
}
