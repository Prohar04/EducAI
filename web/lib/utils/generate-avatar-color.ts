const DARK_FRIENDLY_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#14b8a6", "#3b82f6", "#f97316",
  "#a855f7", "#06b6d4", "#84cc16", "#ef4444",
];

export function generateAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DARK_FRIENDLY_COLORS.length;
  return DARK_FRIENDLY_COLORS[index];
}
