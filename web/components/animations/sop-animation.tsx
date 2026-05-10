"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Line {
	progress: number;
	speed: number;
	width: number;
	bold: boolean;
}

export default function SopAnimation({
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

		const lines: Line[] = [
			{ progress: 0, speed: 0.012, width: 0.55, bold: true },
			{ progress: 0, speed: 0.012, width: 0.4, bold: true },
			{ progress: 0, speed: 0.01, width: 0.7, bold: false },
			{ progress: 0, speed: 0.01, width: 0.65, bold: false },
			{ progress: 0, speed: 0.01, width: 0.75, bold: false },
			{ progress: 0, speed: 0.01, width: 0.6, bold: false },
			{ progress: 0, speed: 0.01, width: 0.7, bold: false },
		];

		let t = 0;
		let lastFrame = 0;
		const INTERVAL = 1000 / 24;

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);
			t += 0.016;

			const padX = W * 0.18;
			const padY = H * 0.1;
			const pageW = W - padX * 2;
			const pageH = H - padY * 2;
			const px = padX;
			const py = padY;

			const glow = ctx.createRadialGradient(
				W / 2,
				H / 2,
				0,
				W / 2,
				H / 2,
				W * 0.6,
			);
			glow.addColorStop(0, "rgba(74,144,217,0.10)");
			glow.addColorStop(1, "rgba(74,144,217,0)");
			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, W, H);

			const r = 6;
			const fold = 14;
			ctx.beginPath();
			ctx.moveTo(px + r, py);
			ctx.lineTo(px + pageW - fold, py);
			ctx.lineTo(px + pageW, py + fold);
			ctx.lineTo(px + pageW, py + pageH - r);
			ctx.quadraticCurveTo(px + pageW, py + pageH, px + pageW - r, py + pageH);
			ctx.lineTo(px + r, py + pageH);
			ctx.quadraticCurveTo(px, py + pageH, px, py + pageH - r);
			ctx.lineTo(px, py + r);
			ctx.quadraticCurveTo(px, py, px + r, py);
			ctx.fillStyle = "rgba(74,144,217,0.04)";
			ctx.fill();
			ctx.strokeStyle = "rgba(74,144,217,0.30)";
			ctx.lineWidth = 1;
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(px + pageW - fold, py);
			ctx.lineTo(px + pageW - fold, py + fold);
			ctx.lineTo(px + pageW, py + fold);
			ctx.strokeStyle = "rgba(74,144,217,0.30)";
			ctx.stroke();

			let activeIndex = 0;
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].progress < 1) {
					activeIndex = i;
					break;
				}
				if (i === lines.length - 1) activeIndex = i;
			}

			lines.forEach((ln, i) => {
				if (!reduced) {
					if (i === 0 || lines[i - 1].progress > 0.8) {
						ln.progress = Math.min(1, ln.progress + ln.speed);
					}
				} else {
					ln.progress = 1;
				}

				const lineY = py + 30 + i * ((pageH - 40) / lines.length);
				const startX = px + 16;
				const maxLen = pageW * ln.width - 32;
				const drawLen = maxLen * ln.progress;

				const fullPulse =
					ln.progress >= 1 && !reduced
						? 0.35 + 0.15 * Math.sin(t * 1.5 + i)
						: 0.55;

				ctx.beginPath();
				ctx.moveTo(startX, lineY);
				ctx.lineTo(startX + drawLen, lineY);
				ctx.strokeStyle = `rgba(74,144,217,${fullPulse.toFixed(3)})`;
				ctx.lineWidth = ln.bold ? 2.2 : 1.4;
				ctx.stroke();
			});

			const cursorLine = lines[activeIndex];
			const cursorY =
				py + 30 + activeIndex * ((pageH - 40) / lines.length);
			const cursorMaxLen = pageW * cursorLine.width - 32;
			const cursorX = px + 16 + cursorMaxLen * cursorLine.progress;
			const blink = reduced ? 1 : Math.sin(t * 6) > 0 ? 1 : 0;
			ctx.beginPath();
			ctx.moveTo(cursorX, cursorY - 6);
			ctx.lineTo(cursorX, cursorY + 6);
			ctx.strokeStyle = `rgba(74,144,217,${(0.85 * blink).toFixed(2)})`;
			ctx.lineWidth = 1.5;
			ctx.stroke();
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
