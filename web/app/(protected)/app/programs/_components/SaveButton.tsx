"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProgram, unsaveProgram } from "@/lib/auth/action";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
	programId: string;
	initialSaved?: boolean;
}

export default function SaveButton({ programId, initialSaved = false }: SaveButtonProps) {
	const [saved, setSaved] = useState(initialSaved);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	function toggle() {
		startTransition(async () => {
			if (saved) {
				await unsaveProgram(programId);
			} else {
				await saveProgram(programId);
			}
			setSaved((prev) => !prev);
			router.refresh();
		});
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
