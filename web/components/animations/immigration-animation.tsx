"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Stamp {
	x: number;
	y: number;
	rotation: number;
	scale: number;
	opacity: number;
	delay: number;
	settled: boolean;
}

export default function ImmigrationAnimation({
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

		const stamps: Stamp[] = [
			{
				x: 0.32,
				y: 0.4,
				rotation: -10,
				scale: 1.3,
				opacity: 0,
				delay: 0.5,
				settled: false,
			},
			{
				x: 0.65,
				y: 0.35,
				rotation: 8,
				scale: 1.3,
				opacity: 0,
				delay: 1.5,
				settled: false,
			},
			{
				x: 0.45,
				y: 0.65,
				rotation: -5,
				scale: 1.3,
				opacity: 0,
				delay: 2.5,
				settled: false,
			},
			{
				x: 0.75,
				y: 0.7,
				rotation: 14,
				scale: 1.3,
				opacity: 0,
				delay: 3.5,
				settled: false,
			},
		];

		let t = 0;
		let lastFrame = 0;
		const INTERVAL = 1000 / 24;

		const drawTexture = () => {
			ctx.strokeStyle = "rgba(74,144,217,0.04)";
			ctx.lineWidth = 0.6;
			for (let i = -H; i < W + H; i += 8) {
				ctx.beginPath();
				ctx.moveTo(i, 0);
				ctx.lineTo(i + H, H);
				ctx.stroke();
			}
		};

		const drawPage = (
			ox: number,
			oy: number,
			pw: number,
			ph: number,
			rot: number,
			withDottedBorder: boolean,
		) => {
			ctx.save();
			ctx.translate(ox + pw / 2, oy + ph / 2);
			ctx.rotate((rot * Math.PI) / 180);
			ctx.translate(-pw / 2, -ph / 2);
			ctx.beginPath();
			ctx.rect(0, 0, pw, ph);
			ctx.fillStyle = "rgba(74,144,217,0.04)";
			ctx.fill();
			ctx.strokeStyle = "rgba(74,144,217,0.30)";
			ctx.lineWidth = 1;
			ctx.stroke();
			if (withDottedBorder) {
				ctx.setLineDash([3, 3]);
				ctx.strokeStyle = "rgba(74,144,217,0.25)";
				ctx.strokeRect(6, 6, pw - 12, ph - 12);
				ctx.setLineDash([]);
			}
			ctx.restore();
		};

		const drawStamp = (s: Stamp) => {
			const cx = s.x * W;
			const cy = s.y * H;
			ctx.save();
			ctx.translate(cx, cy);
			ctx.rotate((s.rotation * Math.PI) / 180);
			ctx.scale(s.scale, s.scale);
			ctx.globalAlpha = s.opacity;

			ctx.beginPath();
			ctx.ellipse(0, 0, 24, 14, 0, 0, Math.PI * 2);
			ctx.strokeStyle = "rgba(74,144,217,0.65)";
			ctx.lineWidth = 1.4;
			ctx.stroke();

			ctx.beginPath();
			ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
			ctx.strokeStyle = "rgba(74,144,217,0.45)";
			ctx.lineWidth = 0.8;
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(-16, 0);
			ctx.lineTo(16, 0);
			ctx.moveTo(0, -10);
			ctx.lineTo(0, 10);
			ctx.strokeStyle = "rgba(74,144,217,0.55)";
			ctx.lineWidth = 0.7;
			ctx.stroke();

			ctx.restore();
		};

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);
			t += 0.04;

			drawTexture();

			const pageW = W * 0.4;
			const pageH = H * 0.7;
			const py = H * 0.15;
			drawPage(W * 0.05, py, pageW, pageH, -3, false);
			drawPage(W * 0.55, py, pageW, pageH, 3, true);

			stamps.forEach((s) => {
				if (!reduced) {
					if (t > s.delay) {
						if (!s.settled) {
							s.scale = Math.max(1, s.scale - 0.04);
							s.opacity = Math.min(1, s.opacity + 0.08);
							if (s.scale <= 1.01) s.settled = true;
						} else {
							s.opacity = Math.max(0.7, s.opacity - 0.005);
						}
					}
				} else {
					s.scale = 1;
					s.opacity = 0.85;
				}
				if (s.opacity > 0) drawStamp(s);
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
