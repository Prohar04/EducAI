/**
 * AcademiaIllustration — abstract graduation cap with orbiting nodes.
 * Used in the Dashboard header strip.
 */
export function AcademiaIllustration({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 220 140"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={className}
		>
			{/* Glow core */}
			<ellipse cx="110" cy="70" rx="56" ry="40" fill="currentColor" fillOpacity="0.05" />

			{/* Cap brim */}
			<polygon
				points="110,28 160,52 110,76 60,52"
				stroke="currentColor"
				strokeOpacity="0.7"
				strokeWidth="2"
				fill="currentColor"
				fillOpacity="0.08"
			/>
			{/* Cap top */}
			<polygon
				points="110,28 160,52 110,38"
				fill="currentColor"
				fillOpacity="0.15"
			/>
			{/* Tassel string */}
			<line x1="160" y1="52" x2="160" y2="80" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="3 2" />
			<circle cx="160" cy="83" r="3" fill="currentColor" fillOpacity="0.6" />

			{/* Orbiting nodes */}
			<circle cx="50" cy="42" r="4" fill="currentColor" fillOpacity="0.4" />
			<circle cx="170" cy="38" r="3" fill="currentColor" fillOpacity="0.35" />
			<circle cx="42" cy="95" r="5" fill="currentColor" fillOpacity="0.3" />
			<circle cx="176" cy="100" r="4" fill="currentColor" fillOpacity="0.35" />
			<circle cx="110" cy="112" r="3.5" fill="currentColor" fillOpacity="0.3" />
			<circle cx="85" cy="30" r="2.5" fill="currentColor" fillOpacity="0.25" />
			<circle cx="138" cy="110" r="2.5" fill="currentColor" fillOpacity="0.25" />

			{/* Connectors */}
			<line x1="110" y1="52" x2="50" y2="42" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
			<line x1="110" y1="52" x2="170" y2="38" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
			<line x1="110" y1="76" x2="42" y2="95" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
			<line x1="110" y1="76" x2="176" y2="100" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
			<line x1="110" y1="76" x2="110" y2="112" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
		</svg>
	);
}

/**
 * ProgramsIllustration — magnifying glass over a grid of cards.
 */
export function ProgramsIllustration({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 180 140"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={className}
		>
			{/* Background grid cards */}
			{[0, 1, 2, 3, 4, 5].map((i) => (
				<rect
					key={i}
					x={18 + (i % 3) * 50}
					y={20 + Math.floor(i / 3) * 54}
					width="38"
					height="44"
					rx="6"
					fill="currentColor"
					fillOpacity={0.06 + i * 0.01}
					stroke="currentColor"
					strokeOpacity="0.15"
					strokeWidth="1"
				/>
			))}
			{/* Card content lines */}
			{[0, 1, 2, 3, 4, 5].map((i) => (
				<g key={`lines-${i}`}>
					<rect
						x={22 + (i % 3) * 50}
						y={30 + Math.floor(i / 3) * 54}
						width={24 + (i % 2) * 4}
						height="3"
						rx="1.5"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x={22 + (i % 3) * 50}
						y={37 + Math.floor(i / 3) * 54}
						width={18}
						height="2"
						rx="1"
						fill="currentColor"
						fillOpacity="0.12"
					/>
				</g>
			))}

			{/* Magnifying glass */}
			<circle cx="116" cy="78" r="30" stroke="currentColor" strokeOpacity="0.6" strokeWidth="3" fill="currentColor" fillOpacity="0.04" />
			<line x1="138" y1="100" x2="156" y2="118" stroke="currentColor" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" />
			{/* Lens highlight */}
			<circle cx="108" cy="70" r="6" fill="currentColor" fillOpacity="0.12" />
		</svg>
	);
}

/**
 * MatchIllustration — sparkle / award podium with ranking lines.
 */
export function MatchIllustration({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 180 140"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={className}
		>
			{/* Podium blocks */}
			<rect x="60" y="82" width="32" height="40" rx="4" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
			<rect x="96" y="64" width="32" height="58" rx="4" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
			<rect x="132" y="94" width="28" height="28" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />

			{/* Rank labels */}
			<text x="76" y="76" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity="0.4" fontWeight="700">2</text>
			<text x="112" y="56" textAnchor="middle" fontSize="14" fill="currentColor" fillOpacity="0.6" fontWeight="700">1</text>
			<text x="146" y="88" textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.35" fontWeight="700">3</text>

			{/* Sparkle stars */}
			<path d="M30 30 L32 22 L34 30 L42 32 L34 34 L32 42 L30 34 L22 32 Z" fill="currentColor" fillOpacity="0.5" />
			<path d="M160 20 L161.5 15 L163 20 L168 21.5 L163 23 L161.5 28 L160 23 L155 21.5 Z" fill="currentColor" fillOpacity="0.4" />
			<path d="M148 50 L149 47 L150 50 L153 51 L150 52 L149 55 L148 52 L145 51 Z" fill="currentColor" fillOpacity="0.3" />

			{/* Score bars in background */}
			<rect x="18" y="50" width="28" height="4" rx="2" fill="currentColor" fillOpacity="0.08" />
			<rect x="18" y="58" width="20" height="4" rx="2" fill="currentColor" fillOpacity="0.06" />
			<rect x="18" y="66" width="24" height="4" rx="2" fill="currentColor" fillOpacity="0.06" />
		</svg>
	);
}

/**
 * SavedIllustration — layered bookmarks.
 */
export function SavedIllustration({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 180 140"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={className}
		>
			{/* Back bookmark */}
			<path
				d="M70 28 H108 A6 6 0 0 1 114 34 V112 L91 96 L68 112 V34 A6 6 0 0 1 70 28 Z"
				fill="currentColor"
				fillOpacity="0.07"
				stroke="currentColor"
				strokeOpacity="0.2"
				strokeWidth="1.5"
				transform="rotate(-8 91 70)"
			/>
			{/* Mid bookmark */}
			<path
				d="M76 22 H112 A6 6 0 0 1 118 28 V108 L97 92 L76 108 V28 A6 6 0 0 1 76 22 Z"
				fill="currentColor"
				fillOpacity="0.1"
				stroke="currentColor"
				strokeOpacity="0.25"
				strokeWidth="1.5"
				transform="rotate(-3 97 65)"
			/>
			{/* Front bookmark */}
			<path
				d="M82 18 H116 A6 6 0 0 1 122 24 V106 L102 90 L82 106 V24 A6 6 0 0 1 82 18 Z"
				fill="currentColor"
				fillOpacity="0.14"
				stroke="currentColor"
				strokeOpacity="0.35"
				strokeWidth="1.5"
			/>
			{/* Bookmark content lines */}
			<rect x="90" y="34" width="24" height="3" rx="1.5" fill="currentColor" fillOpacity="0.25" />
			<rect x="90" y="41" width="18" height="2.5" rx="1.25" fill="currentColor" fillOpacity="0.18" />
			<rect x="90" y="47" width="20" height="2.5" rx="1.25" fill="currentColor" fillOpacity="0.18" />

			{/* Stars */}
			<circle cx="148" cy="36" r="3" fill="currentColor" fillOpacity="0.3" />
			<circle cx="38" cy="52" r="2.5" fill="currentColor" fillOpacity="0.25" />
			<circle cx="155" cy="80" r="2" fill="currentColor" fillOpacity="0.2" />
		</svg>
	);
}

/**
 * ComingSoonIllustration — generic "under construction" style with wrench + nodes.
 */
export function ComingSoonIllustration({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 180 140"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={className}
		>
			{/* Central gear-like circle */}
			<circle cx="90" cy="70" r="30" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="6 4" />
			<circle cx="90" cy="70" r="18" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />

			{/* Clock hands */}
			<line x1="90" y1="70" x2="90" y2="58" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
			<line x1="90" y1="70" x2="99" y2="76" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
			<circle cx="90" cy="70" r="2.5" fill="currentColor" fillOpacity="0.5" />

			{/* Orbiting dots to indicate "coming soon" */}
			<circle cx="42" cy="52" r="5" fill="currentColor" fillOpacity="0.2" />
			<circle cx="140" cy="48" r="4" fill="currentColor" fillOpacity="0.2" />
			<circle cx="38" cy="96" r="4" fill="currentColor" fillOpacity="0.15" />
			<circle cx="144" cy="100" r="5" fill="currentColor" fillOpacity="0.18" />

			<line x1="59" y1="59" x2="73" y2="65" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
			<line x1="123" y1="56" x2="108" y2="63" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
			<line x1="57" y1="90" x2="72" y2="78" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
			<line x1="125" y1="93" x2="112" y2="80" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />

			{/* Sparkle */}
			<path d="M158 24 L159.5 18 L161 24 L167 25.5 L161 27 L159.5 33 L158 27 L152 25.5 Z" fill="currentColor" fillOpacity="0.35" />
			<path d="M18 32 L19 28 L20 32 L24 33 L20 34 L19 38 L18 34 L14 33 Z" fill="currentColor" fillOpacity="0.25" />
		</svg>
	);
}
