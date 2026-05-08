export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
      <div className="h-8 w-48 rounded-lg animate-pulse bg-white/[0.05]" />
      <div className="h-4 w-72 rounded-md animate-pulse bg-white/[0.04]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl animate-pulse bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}
