"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
	programId: string;
	initialSaved?: boolean;
}

export default function SaveButton({ programId, initialSaved = false }: SaveButtonProps) {
	const [saved, setSaved] = useState(initialSaved);
	const [isPending, setIsPending] = useState(false);
	const { mutate } = useSWRConfig();

	async function toggle() {
		setIsPending(true);
		const newSavedState = !saved;

		try {
			if (saved) {
				// Unsave
				const response = await fetch(`/api/saved-programs?programId=${encodeURIComponent(programId)}`, {
					method: "DELETE",
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error("Failed to unsave program");
				}
			} else {
				// Save
				const response = await fetch("/api/saved-programs", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({ programId }),
				});

				if (!response.ok) {
					throw new Error("Failed to save program");
				}
			}

			// Update local state
			setSaved(newSavedState);

			// Trigger SWR revalidation for saved programs list
			await mutate("/api/saved-programs");
		} catch (error) {
			console.error("Save/unsave error:", error);
			// Revert on error
			setSaved(!newSavedState);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Button
			variant={saved ? "secondary" : "outline"}
			size="sm"
			onClick={toggle}
			disabled={isPending}
		>
			{isPending ? "…" : saved ? "Saved ✓" : "Save"}
		</Button>
	);
}
