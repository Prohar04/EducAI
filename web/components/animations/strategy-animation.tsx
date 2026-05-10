"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Piece {
	path: Array<[number, number]>;
	t: number;
	speed: number;
	trail: Array<{ x: number; y: number; life: number }>;
}

export default function StrategyAnimation({
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

		const cols = 8;
		const rows = 4;

		const buildPath = (
			waypoints: Array<[number, number]>,
		): Array<[number, number]> =>
			waypoints.map(([cx, cy]) => [W * cx, H * cy]);

		const pieces: Piece[] = [
			{
				path: buildPath([
					[0.1, 0.3],
					[0.35, 0.35],
					[0.6, 0.25],
					[0.85, 0.4],
				]),
				t: 0,
				speed: 0.0035,
				trail: [],
			},
			{
				path: buildPath([
					[0.15, 0.75],
					[0.4, 0.7],
					[0.55, 0.5],
					[0.8, 0.65],
				]),
				t: 0.3,
				speed: 0.003,
				trail: [],
			},
			{
				path: buildPath([
					[0.5, 0.15],
					[0.55, 0.45],
					[0.45, 0.7],
					[0.5, 0.9],
				]),
				t: 0.6,
				speed: 0.0028,
				trail: [],
			},
		];

		let t = 0;
		let lastFrame = 0;
		const INTERVAL = 1000 / 24;
		const cx = W / 2;
		const cy = H / 2;

		const samplePath = (
			path: Array<[number, number]>,
			ti: number,
		): [number, number] => {
			const segCount = path.length - 1;
			const total = ti * segCount;
			const seg = Math.min(segCount - 1, Math.floor(total));
			const local = total - seg;
			const [x1, y1] = path[seg];
			const [x2, y2] = path[seg + 1];
			return [x1 + (x2 - x1) * local, y1 + (y2 - y1) * local];
		};

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);
			t += 0.016;

			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					const gx = (W / (cols - 1)) * c;
					const gy = (H / (rows - 1)) * r;
					ctx.beginPath();
					ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
					ctx.fillStyle = "rgba(74,144,217,0.18)";
					ctx.fill();
				}
			}

			pieces.forEach((p) => {
				ctx.setLineDash([4, 4]);
				ctx.beginPath();
				p.path.forEach(([px, py], idx) => {
					if (idx === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				});
				ctx.strokeStyle = "rgba(74,144,217,0.10)";
				ctx.lineWidth = 0.8;
				ctx.stroke();
				ctx.setLineDash([]);

				const [px, py] = p.path[p.path.length - 1];
				const pulseR = 4 + 2 * Math.sin(t * 2);
				const pg = ctx.createRadialGradient(px, py, 0, px, py, pulseR * 3);
				pg.addColorStop(0, "rgba(74,144,217,0.30)");
				pg.addColorStop(1, "rgba(74,144,217,0)");
				ctx.beginPath();
				ctx.arc(px, py, pulseR * 3, 0, Math.PI * 2);
				ctx.fillStyle = pg;
				ctx.fill();
				ctx.beginPath();
				ctx.arc(px, py, 3, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(74,144,217,0.65)";
				ctx.fill();
			});

			pieces.forEach((p) => {
				if (!reduced) {
					p.t += p.speed;
					if (p.t >= 1) p.t = 0;
				}
				const [px, py] = samplePath(p.path, p.t);
				p.trail.push({ x: px, y: py, life: 1 });
				if (p.trail.length > 18) p.trail.shift();

				p.trail.forEach((tp, idx) => {
					tp.life = idx / p.trail.length;
					ctx.beginPath();
					ctx.arc(tp.x, tp.y, 1.5, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(74,144,217,${(tp.life * 0.3).toFixed(3)})`;
					ctx.fill();
				});

				const glow = ctx.createRadialGradient(px, py, 0, px, py, 14);
				glow.addColorStop(0, "rgba(74,144,217,0.45)");
				glow.addColorStop(1, "rgba(74,144,217,0)");
				ctx.beginPath();
				ctx.arc(px, py, 14, 0, Math.PI * 2);
				ctx.fillStyle = glow;
				ctx.fill();
				ctx.beginPath();
				ctx.arc(px, py, 4, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(74,144,217,0.90)";
				ctx.fill();
			});

			const angle = reduced ? Math.PI * 0.25 : t * 0.5;
			const sweepRadius = Math.max(W, H);
			const sweep = ctx.createRadialGradient(cx, cy, 0, cx, cy, sweepRadius);
			sweep.addColorStop(0, "rgba(74,144,217,0.10)");
			sweep.addColorStop(1, "rgba(74,144,217,0)");
			ctx.save();
			ctx.translate(cx, cy);
			ctx.rotate(angle);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.arc(0, 0, sweepRadius, -0.25, 0.25);
			ctx.closePath();
			ctx.fillStyle = sweep;
			ctx.fill();
			ctx.restore();
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
