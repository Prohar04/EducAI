"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Spark {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
}

export default function TimelineAnimation({
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

		const milestones = 6;
		let cursorX = 0;
		const cursorSpeed = 0.6;

		const sparks: Spark[] = [];

		let t = 0;
		let lastFrame = 0;
		const INTERVAL = 1000 / 24;

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);
			t += 0.016;

			const lineY = H * 0.5;
			const startX = W * 0.06;
			const endX = W * 0.94;

			if (!reduced) {
				cursorX += cursorSpeed;
				if (cursorX > endX + 20) cursorX = startX - 20;
			} else {
				cursorX = endX * 0.6;
			}

			const nodePositions = Array.from(
				{ length: milestones },
				(_, i) => startX + (endX - startX) * (i / (milestones - 1)),
			);

			ctx.beginPath();
			ctx.moveTo(startX, lineY);
			ctx.lineTo(endX, lineY);
			ctx.strokeStyle = "rgba(74,144,217,0.08)";
			ctx.lineWidth = 1.5;
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(startX, lineY);
			ctx.lineTo(Math.min(cursorX, endX), lineY);
			ctx.strokeStyle = "rgba(74,144,217,0.35)";
			ctx.lineWidth = 1.5;
			ctx.stroke();

			const cg = ctx.createRadialGradient(cursorX, lineY, 0, cursorX, lineY, 18);
			cg.addColorStop(0, "rgba(74,144,217,0.50)");
			cg.addColorStop(1, "rgba(74,144,217,0)");
			ctx.beginPath();
			ctx.arc(cursorX, lineY, 18, 0, Math.PI * 2);
			ctx.fillStyle = cg;
			ctx.fill();

			ctx.beginPath();
			ctx.arc(cursorX, lineY, 3, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(74,144,217,0.90)";
			ctx.fill();

			if (!reduced && Math.random() > 0.5) {
				sparks.push({
					x: cursorX,
					y: lineY,
					vx: (Math.random() - 0.5) * 2,
					vy: (Math.random() - 0.5) * 2,
					life: 1.0,
				});
			}

			for (let i = sparks.length - 1; i >= 0; i--) {
				const s = sparks[i];
				s.x += s.vx;
				s.y += s.vy;
				s.life -= 0.06;
				if (s.life <= 0) {
					sparks.splice(i, 1);
					continue;
				}
				ctx.beginPath();
				ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(74,144,217,${s.life.toFixed(2)})`;
				ctx.fill();
			}

			nodePositions.forEach((nx, i) => {
				const passed = nx <= cursorX;
				const isCurrent = Math.abs(nx - cursorX) < 15;
				const above = i % 2 === 0;

				const nodeAlpha = passed ? 0.85 : 0.25;
				const nodeR =
					isCurrent && !reduced ? 5 + 1.5 * Math.sin(t * 4) : 4.5;

				const ng = ctx.createRadialGradient(
					nx,
					lineY,
					0,
					nx,
					lineY,
					nodeR * 4,
				);
				ng.addColorStop(0, `rgba(74,144,217,${(nodeAlpha * 0.3).toFixed(3)})`);
				ng.addColorStop(1, "rgba(74,144,217,0)");
				ctx.beginPath();
				ctx.arc(nx, lineY, nodeR * 4, 0, Math.PI * 2);
				ctx.fillStyle = ng;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(nx, lineY, nodeR, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(74,144,217,${nodeAlpha.toFixed(2)})`;
				ctx.fill();

				const tickDir = above ? -1 : 1;
				ctx.beginPath();
				ctx.moveTo(nx, lineY + tickDir * nodeR);
				ctx.lineTo(nx, lineY + tickDir * 18);
				ctx.strokeStyle = `rgba(74,144,217,${(nodeAlpha * 0.4).toFixed(3)})`;
				ctx.lineWidth = 0.8;
				ctx.stroke();

				ctx.beginPath();
				ctx.arc(nx, lineY + tickDir * 22, 2, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(74,144,217,${(nodeAlpha * 0.5).toFixed(3)})`;
				ctx.fill();
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
