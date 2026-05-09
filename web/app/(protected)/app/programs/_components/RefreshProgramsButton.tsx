"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { triggerProgramsRefresh } from "@/lib/auth/action";
import { useRouter } from "next/navigation";

type Status = "idle" | "loading" | "success" | "error";

export default function RefreshProgramsButton() {
	const [status, setStatus] = useState<Status>("idle");
	const [message, setMessage] = useState("");
	const router = useRouter();

	async function handleRefresh() {
		setStatus("loading");
		setMessage("");
		const result = await triggerProgramsRefresh();
		if (result.success) {
			setStatus("success");
			setMessage(result.message);
			router.refresh();
		} else {
			setStatus("error");
			setMessage(result.message);
		}
		// Reset to idle after 6s
		setTimeout(() => setStatus("idle"), 6000);
	}

	if (status === "loading") {
		return (
			<button
				disabled
				className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground opacity-70"
			>
				<RefreshCw className="size-3.5 animate-spin" />
				Refreshing…
			</button>
		);
	}

	if (status === "success") {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-lg border border-[#3D9970]/30 bg-[#3D9970]/10 px-3 py-1.5 text-xs font-medium text-[#3D9970]">
				<CheckCircle2 className="size-3.5" />
				{message}
			</span>
		);
	}

	if (status === "error") {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-3 py-1.5 text-xs font-medium text-[#C0392B]">
				<XCircle className="size-3.5" />
				{message}
			</span>
		);
	}

	return (
		<button
			onClick={handleRefresh}
			className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
		>
			<RefreshCw className="size-3.5" />
			Refresh program data
		</button>
	);
}
