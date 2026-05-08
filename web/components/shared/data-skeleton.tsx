import { cn } from "@/lib/utils";

interface DataSkeletonProps {
  variant?: "card" | "list" | "table" | "stat";
  count?: number;
  className?: string;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("shimmer rounded-md bg-white/[0.04]", className)} />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
      <SkeletonBlock className="h-5 w-3/5" />
      <SkeletonBlock className="h-4 w-4/5" />
      <SkeletonBlock className="h-4 w-2/5" />
      <SkeletonBlock className="h-[200px] w-full mt-2" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2 py-1">
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-4/5" />
      <SkeletonBlock className="h-4 w-3/5" />
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <SkeletonBlock className="size-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-16" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="bg-white/[0.03] px-4 py-3 flex gap-4">
        {[4, 3, 3, 2].map((w, i) => (
          <SkeletonBlock key={i} className={`h-3 flex-${w}`} />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-t border-white/[0.04] px-4 py-3 flex gap-4">
          {[4, 3, 3, 2].map((w, j) => (
            <SkeletonBlock key={j} className={`h-3 flex-${w}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DataSkeleton({ variant = "card", count = 3, className }: DataSkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-label="Loading content">
      {items.map((_, i) => {
        switch (variant) {
          case "list": return <ListSkeleton key={i} />;
          case "stat": return <StatSkeleton key={i} />;
          case "table": return i === 0 ? <TableSkeleton key={i} /> : null;
          default: return <CardSkeleton key={i} />;
        }
      })}
    </div>
  );
}
