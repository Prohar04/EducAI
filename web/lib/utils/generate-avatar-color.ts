const DARK_FRIENDLY_COLORS = [
  "#4A90D9", "#5BA0E8", "#3D9970", "#C49A3C",
  "#7A8BA8", "#2E6DAD", "#3A7DBA", "#C0392B",
  "#4A90D9", "#5498DE", "#3D9970", "#7A8BA8",
]

export function generateAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % DARK_FRIENDLY_COLORS.length
  return DARK_FRIENDLY_COLORS[index]
}
