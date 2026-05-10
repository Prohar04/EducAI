"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface CvLine {
	progress: number;
	width: number;
	delay: number;
}

export default function CvAnimation({
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

		const sections = 3;
		const linesPerSection = 3;
		const cvLines: CvLine[] = [];
		for (let s = 0; s < sections; s++) {
			for (let l = 0; l < linesPerSection; l++) {
				cvLines.push({
					progress: 0,
					width: 0.55 + Math.random() * 0.4,
					delay: 0.5 + s * 0.5 + l * 0.15,
				});
			}
		}

		let atsArc = 0;
		const atsTarget = 0.85;
		let dividerProgress = 0;
		let nameProgress = 0;
		let photoProgress = 0;

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
				atsArc = Math.min(atsTarget, atsArc + 0.012);
				dividerProgress = Math.min(1, dividerProgress + 0.015);
				nameProgress = Math.min(1, nameProgress + 0.025);
				photoProgress = Math.min(1, photoProgress + 0.02);
				cvLines.forEach((ln) => {
					if (t > ln.delay) ln.progress = Math.min(1, ln.progress + 0.025);
				});
			} else {
				atsArc = atsTarget;
				dividerProgress = 1;
				nameProgress = 1;
				photoProgress = 1;
				cvLines.forEach((ln) => (ln.progress = 1));
			}

			const pageW = W * 0.5;
			const pageH = H * 0.85;
			const px = W * 0.32;
			const py = H * 0.075;
			const r = 4;

			ctx.beginPath();
			ctx.moveTo(px + r, py);
			ctx.lineTo(px + pageW - r, py);
			ctx.quadraticCurveTo(px + pageW, py, px + pageW, py + r);
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

			const photoSize = 18;
			ctx.fillStyle = `rgba(74,144,217,${(0.25 * photoProgress).toFixed(3)})`;
			ctx.fillRect(px + 8, py + 8, photoSize, photoSize);
			ctx.strokeStyle = `rgba(74,144,217,${(0.5 * photoProgress).toFixed(3)})`;
			ctx.lineWidth = 1;
			ctx.strokeRect(px + 8, py + 8, photoSize, photoSize);

			const nameY = py + 14;
			ctx.beginPath();
			ctx.moveTo(px + 32, nameY);
			ctx.lineTo(px + 32 + (pageW - 50) * 0.5 * nameProgress, nameY);
			ctx.strokeStyle = "rgba(74,144,217,0.65)";
			ctx.lineWidth = 2.4;
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(px + 32, nameY + 8);
			ctx.lineTo(px + 32 + (pageW - 50) * 0.35 * nameProgress, nameY + 8);
			ctx.strokeStyle = "rgba(74,144,217,0.40)";
			ctx.lineWidth = 1.4;
			ctx.stroke();

			const sectionStartY = py + 36;
			const sectionH = (pageH - 44) / sections;
			for (let s = 0; s < sections; s++) {
				const sy = sectionStartY + s * sectionH;
				ctx.beginPath();
				ctx.moveTo(px + 8, sy);
				ctx.lineTo(px + 8 + (pageW - 16) * dividerProgress, sy);
				ctx.strokeStyle = "rgba(74,144,217,0.25)";
				ctx.lineWidth = 0.8;
				ctx.stroke();

				for (let l = 0; l < linesPerSection; l++) {
					const ln = cvLines[s * linesPerSection + l];
					const lyy = sy + 8 + l * 8;
					const maxLen = (pageW - 20) * ln.width;
					ctx.beginPath();
					ctx.moveTo(px + 10, lyy);
					ctx.lineTo(px + 10 + maxLen * ln.progress, lyy);
					ctx.strokeStyle = `rgba(74,144,217,${(0.45 * ln.progress).toFixed(3)})`;
					ctx.lineWidth = 1.2;
					ctx.stroke();
				}
			}

			const arcCx = W * 0.92;
			const arcCy = H * 0.18;
			const arcR = 14;
			ctx.beginPath();
			ctx.arc(arcCx, arcCy, arcR, 0, Math.PI * 2);
			ctx.strokeStyle = "rgba(74,144,217,0.10)";
			ctx.lineWidth = 2.5;
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(
				arcCx,
				arcCy,
				arcR,
				-Math.PI / 2,
				-Math.PI / 2 + Math.PI * 2 * atsArc,
			);
			ctx.strokeStyle = "rgba(74,144,217,0.65)";
			ctx.lineWidth = 2.5;
			ctx.stroke();
			ctx.fillStyle = "rgba(74,144,217,0.75)";
			ctx.font = "9px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(`${Math.round(atsArc * 100)}`, arcCx, arcCy);
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
