"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export default function CareerAnimation({
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

		const points: Array<[number, number]> = [];
		const samples = 80;
		const dataPointTs = [0.05, 0.22, 0.4, 0.58, 0.78, 0.95];
		const ringRadii = dataPointTs.map(() => 0);

		let progress = 0;

		let lastFrame = 0;
		const INTERVAL = 1000 / 24;

		const yAt = (xi: number) => {
			const x = xi;
			const base = 1 - 0.85 * Math.pow(x, 1.6);
			const wobble = 0.04 * Math.sin(x * 14);
			return Math.max(0.08, Math.min(0.95, base + wobble));
		};

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);

			if (!reduced) progress = Math.min(1, progress + 0.01);
			else progress = 1;

			const padX = W * 0.08;
			const padY = H * 0.12;
			const plotW = W - padX * 2;
			const plotH = H - padY * 2;

			ctx.beginPath();
			ctx.moveTo(padX, padY);
			ctx.lineTo(padX, padY + plotH);
			ctx.lineTo(padX + plotW, padY + plotH);
			ctx.strokeStyle = "rgba(74,144,217,0.15)";
			ctx.lineWidth = 1;
			ctx.stroke();

			ctx.setLineDash([2, 4]);
			for (let i = 1; i < 4; i++) {
				const yy = padY + (plotH / 4) * i;
				ctx.beginPath();
				ctx.moveTo(padX, yy);
				ctx.lineTo(padX + plotW, yy);
				ctx.strokeStyle = "rgba(74,144,217,0.06)";
				ctx.stroke();
			}
			ctx.setLineDash([]);

			points.length = 0;
			const lastIndex = Math.floor(samples * progress);
			for (let i = 0; i <= lastIndex; i++) {
				const xi = i / samples;
				const yi = yAt(xi);
				const x = padX + plotW * xi;
				const y = padY + plotH * yi;
				points.push([x, y]);
			}

			if (points.length > 1) {
				ctx.beginPath();
				ctx.moveTo(points[0][0], padY + plotH);
				points.forEach(([x, y]) => ctx.lineTo(x, y));
				ctx.lineTo(points[points.length - 1][0], padY + plotH);
				ctx.closePath();
				ctx.fillStyle = "rgba(74,144,217,0.06)";
				ctx.fill();

				ctx.beginPath();
				ctx.moveTo(points[0][0], points[0][1]);
				for (let i = 1; i < points.length - 1; i++) {
					const [px, py] = points[i];
					const [nx, ny] = points[i + 1];
					ctx.quadraticCurveTo(px, py, (px + nx) / 2, (py + ny) / 2);
				}
				if (points.length > 0) {
					const last = points[points.length - 1];
					ctx.lineTo(last[0], last[1]);
				}
				ctx.strokeStyle = "rgba(74,144,217,0.75)";
				ctx.lineWidth = 1.6;
				ctx.stroke();
			}

			dataPointTs.forEach((dt, i) => {
				if (progress < dt) return;
				const xi = dt;
				const yi = yAt(xi);
				const x = padX + plotW * xi;
				const y = padY + plotH * yi;

				if (ringRadii[i] < 12) ringRadii[i] += 0.6;
				if (ringRadii[i] > 0 && ringRadii[i] < 12) {
					const ringAlpha = 1 - ringRadii[i] / 12;
					ctx.beginPath();
					ctx.arc(x, y, ringRadii[i], 0, Math.PI * 2);
					ctx.strokeStyle = `rgba(74,144,217,${(ringAlpha * 0.5).toFixed(3)})`;
					ctx.lineWidth = 1;
					ctx.stroke();
				}

				const glow = ctx.createRadialGradient(x, y, 0, x, y, 10);
				glow.addColorStop(0, "rgba(74,144,217,0.40)");
				glow.addColorStop(1, "rgba(74,144,217,0)");
				ctx.beginPath();
				ctx.arc(x, y, 10, 0, Math.PI * 2);
				ctx.fillStyle = glow;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(x, y, 3, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(74,144,217,0.90)";
				ctx.fill();
			});

			if (progress >= 1 && points.length > 0) {
				const last = points[points.length - 1];
				const ax = last[0];
				const ay = last[1];
				ctx.beginPath();
				ctx.moveTo(ax, ay);
				ctx.lineTo(ax - 8, ay + 4);
				ctx.moveTo(ax, ay);
				ctx.lineTo(ax - 4, ay + 8);
				ctx.strokeStyle = "rgba(74,144,217,0.85)";
				ctx.lineWidth = 1.4;
				ctx.stroke();
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
