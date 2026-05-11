export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Animated search status */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 20px",
        background: "rgba(74,144,217,0.06)",
        border: "1px solid rgba(74,144,217,0.15)",
        borderRadius: 12,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: "#4A90D9",
          flexShrink: 0,
          animation: "pulse 1.2s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 14, color: "#7A8BA8" }}>
          Analyzing programs matching your profile...
        </span>
      </div>

      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg animate-pulse bg-white/[0.05]" />
        <div className="h-4 w-72 rounded-md animate-pulse bg-white/[0.04]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-52 rounded-xl animate-pulse bg-white/[0.04]"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
