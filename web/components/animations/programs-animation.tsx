"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface UNode {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
	alpha: number;
	fit: number;
	arcProgress: number;
	isCenter: boolean;
	pulsePhase: number;
}

export default function ProgramsAnimation({
	className,
	style,
}: {
	className?: string;
	style?: React.CSSProperties;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rafRef = useRef<number>(0);
	const reduced = useReducedMotion() ?? false;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d", { willReadFrequently: false });
		if (!ctx) return;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		let W = 0;
		let H = 0;

		const init = () => {
			W = canvas.offsetWidth;
			H = canvas.offsetHeight;
			canvas.width = W * dpr;
			canvas.height = H * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		init();

		const nodes: UNode[] = [];

		nodes.push({
			x: W * 0.35,
			y: H * 0.5,
			vx: 0,
			vy: 0,
			r: 7,
			alpha: 0.9,
			fit: 1,
			arcProgress: 0,
			isCenter: true,
			pulsePhase: 0,
		});

		const positions: Array<[number, number]> = [
			[0.65, 0.2],
			[0.8, 0.45],
			[0.7, 0.75],
			[0.5, 0.85],
			[0.15, 0.7],
			[0.1, 0.35],
			[0.4, 0.12],
			[0.88, 0.7],
		];
		positions.forEach(([px, py]) => {
			nodes.push({
				x: W * px,
				y: H * py,
				vx: (Math.random() - 0.5) * 0.15,
				vy: (Math.random() - 0.5) * 0.15,
				r: 3.5 + Math.random() * 2,
				alpha: 0.45 + Math.random() * 0.3,
				fit: 0.4 + Math.random() * 0.55,
				arcProgress: 0,
				isCenter: false,
				pulsePhase: Math.random() * Math.PI * 2,
			});
		});

		let t = 0;
		let lastFrame = 0;
		const FPS = 24;
		const INTERVAL = 1000 / FPS;

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;

			ctx.clearRect(0, 0, W, H);
			t += 0.016;

			const center = nodes[0];

			nodes.forEach((n) => {
				if (!n.isCenter && n.arcProgress < n.fit) {
					n.arcProgress = Math.min(n.fit, n.arcProgress + 0.008);
				}
			});

			nodes.forEach((n, i) => {
				if (i === 0) return;
				const progress = Math.min(1, t * 0.8 - i * 0.1);
				if (progress <= 0) return;

				const ex = center.x + (n.x - center.x) * progress;
				const ey = center.y + (n.y - center.y) * progress;

				const linePulse = reduced
					? 0.15
					: 0.08 + 0.12 * Math.sin(t * 1.5 + i);

				ctx.beginPath();
				ctx.moveTo(center.x, center.y);
				ctx.lineTo(ex, ey);
				ctx.strokeStyle = `rgba(74,144,217,${linePulse.toFixed(3)})`;
				ctx.lineWidth = 0.8;
				ctx.stroke();
			});

			nodes.forEach((n) => {
				if (n.isCenter || n.arcProgress <= 0) return;
				ctx.beginPath();
				ctx.arc(
					n.x,
					n.y,
					n.r + 5,
					-Math.PI / 2,
					-Math.PI / 2 + Math.PI * 2 * n.arcProgress,
				);
				ctx.strokeStyle = `rgba(74,144,217,0.45)`;
				ctx.lineWidth = 1.5;
				ctx.stroke();
			});

			nodes.forEach((n) => {
				if (!n.isCenter) {
					if (!reduced) {
						n.x += n.vx;
						n.y += n.vy;
						if (n.x < n.r || n.x > W - n.r) n.vx *= -1;
						if (n.y < n.r || n.y > H - n.r) n.vy *= -1;
					}
				}

				const pulse =
					n.isCenter && !reduced
						? 0.7 + 0.3 * Math.sin(t * 2 + n.pulsePhase)
						: n.alpha;

				const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
				glow.addColorStop(0, `rgba(74,144,217,${(pulse * 0.3).toFixed(3)})`);
				glow.addColorStop(1, "rgba(74,144,217,0)");
				ctx.beginPath();
				ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
				ctx.fillStyle = glow;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(
					n.x,
					n.y,
					n.isCenter ? n.r * (0.85 + 0.15 * Math.sin(t * 2)) : n.r,
					0,
					Math.PI * 2,
				);
				ctx.fillStyle = `rgba(74,144,217,${pulse.toFixed(3)})`;
				ctx.fill();
			});
		};

		if (!reduced) {
			rafRef.current = requestAnimationFrame(render);
		} else {
			render(0);
			cancelAnimationFrame(rafRef.current);
		}

		const ro = new ResizeObserver(() => {
			cancelAnimationFrame(rafRef.current);
			init();
			if (!reduced) rafRef.current = requestAnimationFrame(render);
		});
		ro.observe(canvas);

		const onVis = () => {
			if (document.hidden) cancelAnimationFrame(rafRef.current);
			else if (!reduced) rafRef.current = requestAnimationFrame(render);
		};
		document.addEventListener("visibilitychange", onVis);

		return () => {
			cancelAnimationFrame(rafRef.current);
			ro.disconnect();
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [reduced]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className={className}
			style={{ width: "100%", height: "100%", display: "block", ...style }}
		/>
	);
}
