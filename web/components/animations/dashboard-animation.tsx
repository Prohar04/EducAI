"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Bar {
	target: number;
	current: number;
	prev: number;
}

interface MetricBar {
	target: number;
	current: number;
	prev: number;
}

export default function DashboardAnimation({
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

		const randTarget = () => 0.55 + Math.random() * 0.4;

		const bars: Bar[] = Array.from({ length: 4 }, () => ({
			target: randTarget(),
			current: 0,
			prev: 0,
		}));

		const ringTarget = 0.78;
		let ringCurrent = 0;

		const metricBars: MetricBar[] = Array.from({ length: 3 }, () => ({
			target: 0.5 + Math.random() * 0.45,
			current: 0,
			prev: 0,
		}));

		let cycleStart = 0;
		const cycleDuration = 8;

		let t = 0;
		let lastFrame = 0;
		const INTERVAL = 1000 / 24;

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);
			t += 0.04;

			const elapsed = t - cycleStart;
			if (!reduced && elapsed > cycleDuration) {
				cycleStart = t;
				bars.forEach((b) => {
					b.prev = b.current;
					b.target = randTarget();
				});
				metricBars.forEach((m) => {
					m.prev = m.current;
					m.target = 0.5 + Math.random() * 0.45;
				});
			}

			if (!reduced) {
				bars.forEach((b) => {
					b.current += (b.target - b.current) * 0.05;
				});
				ringCurrent += (ringTarget - ringCurrent) * 0.04;
				metricBars.forEach((m) => {
					m.current += (m.target - m.current) * 0.05;
				});
			} else {
				bars.forEach((b) => (b.current = b.target));
				ringCurrent = ringTarget;
				metricBars.forEach((m) => (m.current = m.target));
			}

			const padX = W * 0.06;
			const padY = H * 0.1;
			const chartW = W * 0.55;
			const chartH = H * 0.55;
			const barAreaY = padY;

			const barGap = 6;
			const barW = (chartW - barGap * (bars.length - 1)) / bars.length;
			bars.forEach((b, i) => {
				const bx = padX + i * (barW + barGap);
				const bh = chartH * b.current;
				const by = barAreaY + chartH - bh;

				const grad = ctx.createLinearGradient(0, by, 0, by + bh);
				grad.addColorStop(0, "rgba(74,144,217,0.55)");
				grad.addColorStop(1, "rgba(74,144,217,0.20)");
				ctx.fillStyle = grad;
				ctx.fillRect(bx, by, barW, bh);

				const glow = ctx.createRadialGradient(
					bx + barW / 2,
					by,
					0,
					bx + barW / 2,
					by,
					barW * 0.8,
				);
				glow.addColorStop(0, "rgba(74,144,217,0.40)");
				glow.addColorStop(1, "rgba(74,144,217,0)");
				ctx.fillStyle = glow;
				ctx.beginPath();
				ctx.arc(bx + barW / 2, by, barW * 0.8, 0, Math.PI * 2);
				ctx.fill();
			});

			ctx.beginPath();
			bars.forEach((b, i) => {
				const bx = padX + i * (barW + barGap) + barW / 2;
				const py = barAreaY + chartH - chartH * b.current - 8;
				if (i === 0) ctx.moveTo(bx, py);
				else ctx.lineTo(bx, py);
			});
			ctx.strokeStyle = "rgba(74,144,217,0.55)";
			ctx.lineWidth = 1;
			ctx.stroke();
			bars.forEach((b, i) => {
				const bx = padX + i * (barW + barGap) + barW / 2;
				const py = barAreaY + chartH - chartH * b.current - 8;
				ctx.beginPath();
				ctx.arc(bx, py, 2.2, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(74,144,217,0.85)";
				ctx.fill();
			});

			const ringCx = W * 0.85;
			const ringCy = padY + 22;
			const ringR = 18;
			ctx.beginPath();
			ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
			ctx.strokeStyle = "rgba(74,144,217,0.10)";
			ctx.lineWidth = 3;
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(
				ringCx,
				ringCy,
				ringR,
				-Math.PI / 2,
				-Math.PI / 2 + Math.PI * 2 * ringCurrent,
			);
			ctx.strokeStyle = "rgba(74,144,217,0.70)";
			ctx.lineWidth = 3;
			ctx.stroke();
			ctx.fillStyle = "rgba(74,144,217,0.85)";
			ctx.font = "10px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(`${Math.round(ringCurrent * 100)}%`, ringCx, ringCy);

			const metricStartY = padY + chartH + 12;
			const metricH = 5;
			const metricW = W * 0.55;
			metricBars.forEach((m, i) => {
				const my = metricStartY + i * (metricH + 6);
				ctx.fillStyle = "rgba(74,144,217,0.10)";
				ctx.fillRect(padX, my, metricW, metricH);
				ctx.fillStyle = "rgba(74,144,217,0.55)";
				ctx.fillRect(padX, my, metricW * m.current, metricH);
			});
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
