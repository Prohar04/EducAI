"use client";

type FadeInProps = {
	children: React.ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
};

export function FadeIn({ children, delay = 0, duration = 0.4, className }: FadeInProps) {
	return (
		<div
			className={className}
			style={{
				animation: `fadeUp ${duration}s cubic-bezier(0.22, 1, 0.36, 1) both`,
				animationDelay: `${delay}s`,
			}}
		>
			{children}
		</div>
	);
}

export function StaggerChildren({
	children,
	stagger: _stagger = 0.08,
	className,
}: {
	children: React.ReactNode;
	stagger?: number;
	className?: string;
}) {
	return (
		<div className={className}>
			{children}
		</div>
	);
}

export function StaggerItem({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={className}>
			{children}
		</div>
	);
}
