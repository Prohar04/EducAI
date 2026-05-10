"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Pin {
	x: number;
	y: number;
	appearProgress: number;
	delay: number;
	rippleR: number;
}

interface Arc {
	from: number;
	to: number;
	progress: number;
	delay: number;
}

export default function JobsAnimation({
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

		const cityCoords: Array<[number, number]> = [
			[0.18, 0.32],
			[0.28, 0.45],
			[0.38, 0.4],
			[0.45, 0.35],
			[0.55, 0.6],
			[0.62, 0.55],
			[0.7, 0.42],
			[0.78, 0.5],
			[0.85, 0.35],
			[0.88, 0.7],
		];

		const pins: Pin[] = cityCoords.map(([px, py], i) => ({
			x: W * px,
			y: H * py,
			appearProgress: 0,
			delay: 0.15 * i,
			rippleR: 0,
		}));

		const arcs: Arc[] = [
			{ from: 0, to: 3, progress: 0, delay: 1.8 },
			{ from: 2, to: 6, progress: 0, delay: 2.3 },
			{ from: 4, to: 8, progress: 0, delay: 2.8 },
			{ from: 7, to: 9, progress: 0, delay: 3.3 },
		];

		let planeT = 0;

		let t = 0;
		let lastFrame = 0;
		const INTERVAL = 1000 / 24;

		const drawContinents = () => {
			ctx.strokeStyle = "rgba(74,144,217,0.08)";
			ctx.lineWidth = 1.2;
			const continents: Array<Array<[number, number]>> = [
				[
					[0.05, 0.4],
					[0.12, 0.32],
					[0.2, 0.35],
					[0.22, 0.42],
					[0.18, 0.55],
					[0.1, 0.58],
					[0.06, 0.5],
				],
				[
					[0.32, 0.3],
					[0.4, 0.28],
					[0.5, 0.32],
					[0.52, 0.45],
					[0.45, 0.55],
					[0.36, 0.5],
					[0.32, 0.4],
				],
				[
					[0.55, 0.3],
					[0.65, 0.28],
					[0.78, 0.32],
					[0.82, 0.42],
					[0.78, 0.55],
					[0.65, 0.58],
					[0.58, 0.5],
				],
				[
					[0.82, 0.62],
					[0.92, 0.65],
					[0.94, 0.78],
					[0.86, 0.8],
				],
			];
			continents.forEach((shape) => {
				ctx.beginPath();
				shape.forEach(([px, py], i) => {
					const x = W * px;
					const y = H * py;
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				});
				ctx.closePath();
				ctx.stroke();
			});
		};

		const drawPin = (px: number, py: number, scale: number, alpha: number) => {
			const r = 4 * scale;
			ctx.beginPath();
			ctx.arc(px, py - r, r, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(74,144,217,${alpha.toFixed(3)})`;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(px - r * 0.7, py - r);
			ctx.lineTo(px, py + r * 0.6);
			ctx.lineTo(px + r * 0.7, py - r);
			ctx.closePath();
			ctx.fillStyle = `rgba(74,144,217,${alpha.toFixed(3)})`;
			ctx.fill();
		};

		const arcPoint = (
			from: Pin,
			to: Pin,
			progress: number,
		): [number, number, number, number] => {
			const mx = (from.x + to.x) / 2;
			const my = (from.y + to.y) / 2 - 30;
			const tt = progress;
			const x = (1 - tt) * (1 - tt) * from.x + 2 * (1 - tt) * tt * mx + tt * tt * to.x;
			const y = (1 - tt) * (1 - tt) * from.y + 2 * (1 - tt) * tt * my + tt * tt * to.y;
			const dx =
				2 * (1 - tt) * (mx - from.x) + 2 * tt * (to.x - mx);
			const dy =
				2 * (1 - tt) * (my - from.y) + 2 * tt * (to.y - my);
			return [x, y, dx, dy];
		};

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);
			t += 0.04;

			drawContinents();

			pins.forEach((p) => {
				if (!reduced) {
					if (t > p.delay) {
						p.appearProgress = Math.min(1, p.appearProgress + 0.08);
						if (p.appearProgress < 1) p.rippleR = 0;
						else if (p.rippleR < 24) p.rippleR += 1.2;
					}
				} else {
					p.appearProgress = 1;
					p.rippleR = 0;
				}

				if (p.rippleR > 0 && p.rippleR < 24) {
					const a = 1 - p.rippleR / 24;
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.rippleR, 0, Math.PI * 2);
					ctx.strokeStyle = `rgba(74,144,217,${(a * 0.4).toFixed(3)})`;
					ctx.lineWidth = 1;
					ctx.stroke();
				}

				if (p.appearProgress > 0) {
					drawPin(p.x, p.y, p.appearProgress, 0.7 * p.appearProgress);
				}
			});

			arcs.forEach((arc) => {
				if (!reduced) {
					if (t > arc.delay) arc.progress = Math.min(1, arc.progress + 0.012);
				} else {
					arc.progress = 1;
				}
				if (arc.progress <= 0) return;

				const from = pins[arc.from];
				const to = pins[arc.to];
				ctx.beginPath();
				const steps = 24;
				for (let i = 0; i <= steps * arc.progress; i++) {
					const tt = i / steps;
					const [x, y] = arcPoint(from, to, tt);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.strokeStyle = "rgba(74,144,217,0.30)";
				ctx.lineWidth = 1;
				ctx.stroke();
			});

			if (!reduced) {
				planeT += 0.006;
				if (planeT > 1) planeT = 0;
			} else {
				planeT = 0.5;
			}
			const liveArc = arcs[0];
			if (liveArc.progress >= 1) {
				const [x, y, dx, dy] = arcPoint(pins[liveArc.from], pins[liveArc.to], planeT);
				const angle = Math.atan2(dy, dx);
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(angle);
				ctx.beginPath();
				ctx.moveTo(5, 0);
				ctx.lineTo(-3, -3);
				ctx.lineTo(-1, 0);
				ctx.lineTo(-3, 3);
				ctx.closePath();
				ctx.fillStyle = "rgba(74,144,217,0.85)";
				ctx.fill();
				ctx.restore();
			}
		};

		if (!reduced) rafRef.current = requestAnimationFrame(render);
		else {
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
