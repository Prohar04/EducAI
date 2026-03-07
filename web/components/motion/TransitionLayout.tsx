"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

type Props = { children: React.ReactNode };

/**
 * Wraps page content with a subtle fade+slide transition on route change.
 * Place this inside a layout that wraps the `{children}` slot.
 */
export function TransitionLayout({ children }: Props) {
	const key = usePathname();

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={key}
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
				transition={{ duration: 0.25, ease: "easeInOut" }}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}
