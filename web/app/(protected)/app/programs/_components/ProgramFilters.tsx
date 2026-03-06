"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LEVELS = [
	{ value: "", label: "All levels" },
	{ value: "BSC", label: "Bachelor's" },
	{ value: "MSC", label: "Master's" },
	{ value: "PHD", label: "PhD" },
	{ value: "MBA", label: "MBA" },
	{ value: "DIPLOMA", label: "Diploma" },
];

export default function ProgramFilters({ current }: { current: Record<string, string> }) {
	const router = useRouter();
	const pathname = usePathname();

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const params = new URLSearchParams();
		for (const [key, value] of fd.entries()) {
			if (value && typeof value === "string") params.set(key, value);
		}
		router.push(`${pathname}?${params.toString()}`);
	}

	const hasFilters = ["q", "level", "field", "country"].some((k) => current[k]);

	return (
		<form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-center gap-3">
			<Input
				name="q"
				className="h-9 w-48"
				placeholder="Search programs…"
				defaultValue={current.q ?? ""}
			/>
			<select
				name="level"
				defaultValue={current.level ?? ""}
				className="h-9 rounded-md border border-input bg-background px-3 text-sm"
			>
				{LEVELS.map((l) => (
					<option key={l.value} value={l.value}>
						{l.label}
					</option>
				))}
			</select>
			<Input
				name="field"
				className="h-9 w-40"
				placeholder="Field (e.g. CS)"
				defaultValue={current.field ?? ""}
			/>
			<Input
				name="country"
				className="h-9 w-36"
				placeholder="Country (US, GB…)"
				defaultValue={current.country ?? ""}
			/>
			<Button type="submit" size="sm">
				Search
			</Button>
			{hasFilters && (
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => router.push(pathname)}
				>
					Clear
				</Button>
			)}
		</form>
	);
}
