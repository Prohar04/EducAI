"use client";

import { motion, useReducedMotion } from "framer-motion";

type FadeInProps = {
	children: React.ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
};

/**
 * Simple fade-in on mount. Use for page-level sections and hero content.
 * Automatically disables motion when prefers-reduced-motion is set.
 */
export function FadeIn({ children, delay = 0, duration = 0.4, className }: FadeInProps) {
	const reduced = useReducedMotion();

	return (
		<motion.div
			initial={reduced ? false : { opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: reduced ? 0 : duration, delay, ease: [0.22, 1, 0.36, 1] }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

/**
 * Staggered wrapper — children with FadeIn receive sequential delays.
 * Usage:
 *   <StaggerChildren stagger={0.08}>
 *     {items.map(i => <FadeIn key={i.id}>{i.content}</FadeIn>)}
 *   </StaggerChildren>
 */
export function StaggerChildren({
	children,
	stagger = 0.08,
	className,
}: {
	children: React.ReactNode;
	stagger?: number;
	className?: string;
}) {
	const reduced = useReducedMotion();

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={{
				hidden: {},
				visible: { transition: { staggerChildren: reduced ? 0 : stagger } },
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

/**
 * Individual stagger item — must be a child of StaggerChildren.
 */
export function StaggerItem({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const reduced = useReducedMotion();

	return (
		<motion.div
			variants={
				reduced
					? {}
					: {
							hidden:  { opacity: 0, y: 16 },
							visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
					  }
			}
			className={className}
		>
			{children}
		</motion.div>
	);
}
