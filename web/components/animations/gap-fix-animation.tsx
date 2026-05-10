"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export default function GapFixAnimation({
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

		const axes = 6;
		const scores = [0.8, 0.55, 0.3, 0.7, 0.45, 0.6];

		let progress = 0;
		const pulsePhases = scores.map((_, i) => i * 0.4);

		let t = 0;
		let lastFrame = 0;
		const INTERVAL = 1000 / 24;

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);
			t += 0.04;

			if (!reduced) progress = Math.min(1, progress + 0.012);
			else progress = 1;

			const cx = W / 2;
			const cy = H / 2;
			const maxR = Math.min(W, H) * 0.42;

			const angleAt = (i: number) => -Math.PI / 2 + (Math.PI * 2 * i) / axes;

			for (let ring = 1; ring <= 3; ring++) {
				const rr = (maxR * ring) / 3;
				ctx.beginPath();
				for (let i = 0; i <= axes; i++) {
					const a = angleAt(i % axes);
					const x = cx + Math.cos(a) * rr;
					const y = cy + Math.sin(a) * rr;
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.strokeStyle = `rgba(74,144,217,${(0.05 + ring * 0.04).toFixed(3)})`;
				ctx.lineWidth = 0.8;
				ctx.stroke();
			}

			for (let i = 0; i < axes; i++) {
				const a = angleAt(i);
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
				ctx.strokeStyle = "rgba(74,144,217,0.10)";
				ctx.lineWidth = 0.6;
				ctx.stroke();
			}

			ctx.beginPath();
			for (let i = 0; i < axes; i++) {
				const a = angleAt(i);
				const r = scores[i] * maxR * progress;
				const x = cx + Math.cos(a) * r;
				const y = cy + Math.sin(a) * r;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.closePath();
			ctx.fillStyle = "rgba(74,144,217,0.10)";
			ctx.fill();
			ctx.strokeStyle = "rgba(74,144,217,0.55)";
			ctx.lineWidth = 1.5;
			ctx.stroke();

			for (let i = 0; i < axes; i++) {
				const a = angleAt(i);
				const r = scores[i] * maxR * progress;
				const x = cx + Math.cos(a) * r;
				const y = cy + Math.sin(a) * r;

				const pulse =
					!reduced && progress >= 1
						? 0.7 + 0.3 * Math.sin(t * 2 + pulsePhases[i])
						: 1;

				ctx.beginPath();
				ctx.arc(x, y, 3 * pulse, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(74,144,217,0.85)";
				ctx.fill();

				const vx = cx + Math.cos(a) * (maxR + 8);
				const vy = cy + Math.sin(a) * (maxR + 8);
				ctx.beginPath();
				ctx.arc(vx, vy, 2, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(74,144,217,0.45)";
				ctx.fill();
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
