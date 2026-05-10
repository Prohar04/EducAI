"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Coin {
	x: number;
	y: number;
	r: number;
	speed: number;
	drift: number;
	driftSpeed: number;
	driftOffset: number;
	alpha: number;
	isEligible: boolean;
	pulsePhase: number;
}

export default function ScholarshipsAnimation({
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

		const coins: Coin[] = Array.from({ length: 14 }, (_, i) => ({
			x: Math.random() * W,
			y: Math.random() * H,
			r: 7 + Math.random() * 5,
			speed: 0.3 + Math.random() * 0.5,
			drift: 12 + Math.random() * 18,
			driftSpeed: 0.008 + Math.random() * 0.012,
			driftOffset: Math.random() * Math.PI * 2,
			alpha: 0.3 + Math.random() * 0.3,
			isEligible: i < 4,
			pulsePhase: Math.random() * Math.PI * 2,
		}));

		let t = 0;
		let lastFrame = 0;
		const INTERVAL = 1000 / 24;

		const render = (now: number) => {
			rafRef.current = requestAnimationFrame(render);
			if (now - lastFrame < INTERVAL) return;
			lastFrame = now;
			ctx.clearRect(0, 0, W, H);
			t += 0.016;

			const bgPositions: Array<[number, number, number]> = [
				[0.2, 0.5, 60],
				[0.6, 0.3, 45],
				[0.85, 0.7, 35],
			];
			bgPositions.forEach(([px, py, br]) => {
				ctx.beginPath();
				ctx.arc(W * px, H * py, br, 0, Math.PI * 2);
				ctx.strokeStyle = "rgba(196,154,60,0.04)";
				ctx.lineWidth = 1.5;
				ctx.stroke();
			});

			coins.forEach((coin) => {
				const cx =
					coin.x +
					Math.sin(t * coin.driftSpeed * 60 + coin.driftOffset) * coin.drift;
				const pulse =
					coin.isEligible && !reduced
						? coin.alpha * (0.7 + 0.5 * Math.sin(t * 2 + coin.pulsePhase))
						: coin.alpha;
				const col = `rgba(196,154,60,${pulse.toFixed(3)})`;

				const g = ctx.createRadialGradient(
					cx,
					coin.y,
					0,
					cx,
					coin.y,
					coin.r * 2.5,
				);
				g.addColorStop(0, `rgba(196,154,60,${(pulse * 0.25).toFixed(3)})`);
				g.addColorStop(1, "rgba(196,154,60,0)");
				ctx.beginPath();
				ctx.arc(cx, coin.y, coin.r * 2.5, 0, Math.PI * 2);
				ctx.fillStyle = g;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(cx, coin.y, coin.r, 0, Math.PI * 2);
				ctx.strokeStyle = col;
				ctx.lineWidth = 1.2;
				ctx.stroke();

				ctx.beginPath();
				ctx.arc(cx, coin.y, coin.r * 0.65, 0, Math.PI * 2);
				ctx.strokeStyle = `rgba(196,154,60,${(pulse * 0.4).toFixed(3)})`;
				ctx.lineWidth = 0.7;
				ctx.stroke();

				ctx.fillStyle = col;
				ctx.font = `${coin.r * 0.9}px sans-serif`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText("★", cx, coin.y);

				if (!reduced) {
					coin.y += coin.speed;
					if (coin.y > H + coin.r * 2) {
						coin.y = -coin.r * 2;
						coin.x = Math.random() * W;
					}
				}
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
