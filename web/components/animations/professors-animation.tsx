"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface ProfNode {
	x: number;
	y: number;
	r: number;
	connected: boolean;
	connectProgress: number;
	pulsePhase: number;
}

export default function ProfessorsAnimation({
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

		const studentX = W * 0.12;
		const studentY = H * 0.5;

		const profPositions: Array<[number, number]> = [
			[0.4, 0.2],
			[0.55, 0.4],
			[0.45, 0.65],
			[0.35, 0.85],
			[0.7, 0.25],
			[0.78, 0.55],
			[0.72, 0.78],
			[0.92, 0.4],
			[0.88, 0.7],
		];

		const nodes: ProfNode[] = profPositions.map(([px, py]) => ({
			x: W * px,
			y: H * py,
			r: 4 + Math.random() * 1.5,
			connected: false,
			connectProgress: 0,
			pulsePhase: Math.random() * Math.PI * 2,
		}));

		let pingRadius = 0;
		const pingMax = Math.max(W, H);

		let t = 0;
		let lastFrame = 0;
		const INTERVAL = 1000 / 24;

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);
			t += 0.04;

			if (!reduced) {
				pingRadius += 2.5;
				if (pingRadius > pingMax) pingRadius = 0;
			} else {
				pingRadius = pingMax * 0.6;
			}

			ctx.beginPath();
			ctx.arc(studentX, studentY, pingRadius, 0, Math.PI * 2);
			ctx.strokeStyle = `rgba(74,144,217,${(0.18 * (1 - pingRadius / pingMax)).toFixed(3)})`;
			ctx.lineWidth = 1;
			ctx.stroke();

			nodes.forEach((n) => {
				const dx = n.x - studentX;
				const dy = n.y - studentY;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (!n.connected && pingRadius >= dist) {
					n.connected = true;
				}
				if (n.connected && n.connectProgress < 1) {
					n.connectProgress = Math.min(1, n.connectProgress + 0.04);
				}
			});

			nodes.forEach((n) => {
				if (n.connectProgress <= 0) return;
				const ex = studentX + (n.x - studentX) * n.connectProgress;
				const ey = studentY + (n.y - studentY) * n.connectProgress;
				ctx.beginPath();
				ctx.moveTo(studentX, studentY);
				ctx.lineTo(ex, ey);
				ctx.strokeStyle = "rgba(74,144,217,0.20)";
				ctx.lineWidth = 0.8;
				ctx.stroke();
			});

			nodes.forEach((n) => {
				const litAlpha = n.connected ? 0.7 : 0.25;
				const pulse = !reduced
					? litAlpha * (0.85 + 0.15 * Math.sin(t + n.pulsePhase))
					: litAlpha;

				const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
				glow.addColorStop(0, `rgba(74,144,217,${(pulse * 0.3).toFixed(3)})`);
				glow.addColorStop(1, "rgba(74,144,217,0)");
				ctx.beginPath();
				ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
				ctx.fillStyle = glow;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(74,144,217,${pulse.toFixed(3)})`;
				ctx.fill();

				if (n.connected && n.connectProgress >= 1) {
					const ex = n.x + n.r + 4;
					const ey = n.y - 4;
					const ew = 8;
					const eh = 6;
					ctx.beginPath();
					ctx.rect(ex, ey, ew, eh);
					ctx.strokeStyle = "rgba(74,144,217,0.55)";
					ctx.lineWidth = 0.7;
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(ex, ey);
					ctx.lineTo(ex + ew / 2, ey + eh / 2);
					ctx.lineTo(ex + ew, ey);
					ctx.stroke();
				}
			});

			const studentR = 7;
			const sg = ctx.createRadialGradient(
				studentX,
				studentY,
				0,
				studentX,
				studentY,
				studentR * 4,
			);
			sg.addColorStop(0, "rgba(74,144,217,0.40)");
			sg.addColorStop(1, "rgba(74,144,217,0)");
			ctx.beginPath();
			ctx.arc(studentX, studentY, studentR * 4, 0, Math.PI * 2);
			ctx.fillStyle = sg;
			ctx.fill();
			const studentPulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 2);
			ctx.beginPath();
			ctx.arc(studentX, studentY, studentR * studentPulse, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(74,144,217,0.90)";
			ctx.fill();
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
