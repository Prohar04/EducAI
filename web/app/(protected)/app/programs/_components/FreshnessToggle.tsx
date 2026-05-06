"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function FreshnessToggle({
	showStale,
	staleHiddenCount,
}: {
	showStale: boolean;
	staleHiddenCount: number;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function toggle() {
		const params = new URLSearchParams(searchParams.toString());
		if (showStale) {
			params.delete("showStale");
		} else {
			params.set("showStale", "true");
		}
		// Reset to page 1 when toggling
		params.delete("page");
		router.push(`${pathname}?${params.toString()}`);
	}

	if (showStale) {
		return (
			<button
				onClick={toggle}
				className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
			>
				<EyeOff className="size-3.5" />
				Hide cached/stale programs
			</button>
		);
	}

	if (staleHiddenCount === 0) return null;

	return (
		<button
			onClick={toggle}
			className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
		>
			<Eye className="size-3.5" />
			Show cached/stale programs
			<span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
				{staleHiddenCount}
			</span>
		</button>
	);
}
