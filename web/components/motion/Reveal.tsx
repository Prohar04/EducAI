"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type RevealProps = {
	children: React.ReactNode;
	/** Delay in seconds before the reveal starts (default: 0) */
	delay?: number;
	/** Direction the element slides in from (default: "up") */
	from?: "up" | "down" | "left" | "right";
	className?: string;
};

const directionMap = {
	up:    { y: 32, x: 0 },
	down:  { y: -32, x: 0 },
	left:  { y: 0, x: 32 },
	right: { y: 0, x: -32 },
};

export function Reveal({ children, delay = 0, from = "up", className }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-60px" });

	const hidden  = { opacity: 0, ...directionMap[from] };
	const visible = { opacity: 1, y: 0, x: 0 };

	return (
		<motion.div
			ref={ref}
			initial={hidden}
			animate={isInView ? visible : hidden}
			transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
