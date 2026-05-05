/* global React */

/*
  DCTireRealistic — high-fidelity SVG tire rolling on a road.
  - Hyper-detailed alloy wheel (5 twin-spoke), brake disc with vents,
    lug nuts, valve stem, hub cap with DC branding.
  - Sidewall with embossed "MICHELIN" typography, sub-line spec text,
    raised letters via duotone shadow trick.
  - Aggressive directional tread pattern (shoulder lugs + center ribs +
    sipes) with subtle wear gradient.
  - Sits on a scrolling asphalt road with a dashed lane line.
  - Soft contact shadow that pulses with rotation.

  Usage:
    <DCTireRealistic />          // fills its container, road included
    <DCTireRealistic showRoad={false} /> // tire only, transparent bg

  The component is fixed-aspect (4:5 portrait) and self-contained.
*/

function DCTireRealistic({ showRoad = true, className = "", style = {} }) {
  // 24 deep tread blocks around the circumference
  const treadCount = 24;
  const treadBlocks = [];
  for (let i = 0; i < treadCount; i++) {
    const a = (i / treadCount) * 360;
    treadBlocks.push(
      <g key={`tb-${i}`} transform={`rotate(${a} 200 200)`}>
        {/* shoulder lug — outer */}
        <path d="M188 18 L212 18 L214 38 L186 38 Z" fill="#0b0b0c" />
        {/* sipe cut */}
        <rect x="199" y="18" width="2" height="20" fill="#000" opacity="0.85" />
        {/* center rib block */}
        <path d="M191 40 L209 40 L211 58 L189 58 Z" fill="#101012" />
        <rect x="199" y="40" width="2" height="18" fill="#000" opacity="0.7" />
      </g>
    );
  }

  // 5 twin-spoke alloy spokes
  const spokes = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 360;
    spokes.push(
      <g key={`sp-${i}`} transform={`rotate(${a} 200 200)`}>
        {/* twin spoke */}
        <path
          d="M194 100 L198 100 L201 168 L197 168 Z"
          fill="url(#alloyHi)"
        />
        <path
          d="M202 100 L206 100 L203 168 L207 168 Z"
          fill="url(#alloyHi)"
        />
        {/* spoke shadow line between twins */}
        <line x1="200" y1="102" x2="200" y2="166" stroke="#2a2c30" strokeWidth="0.8" />
        {/* outer spoke shoulder */}
        <path
          d="M192 100 L208 100 L210 110 L190 110 Z"
          fill="url(#alloyEdge)"
        />
      </g>
    );
  }

  // 5 lug nuts on the hub
  const lugs = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 360 + 36;
    const rad = (a * Math.PI) / 180;
    const cx = 200 + Math.cos(rad - Math.PI / 2) * 40;
    const cy = 200 + Math.sin(rad - Math.PI / 2) * 40;
    lugs.push(
      <g key={`lug-${i}`}>
        <circle cx={cx} cy={cy} r="6" fill="#1a1c20" />
        <circle cx={cx - 0.8} cy={cy - 0.8} r="4.5" fill="url(#lugHi)" />
        {/* hex marks */}
        {Array.from({ length: 6 }).map((_, k) => {
          const ka = (k / 6) * 360;
          const kr = (ka * Math.PI) / 180;
          return (
            <line
              key={k}
              x1={cx + Math.cos(kr) * 2.3}
              y1={cy + Math.sin(kr) * 2.3}
              x2={cx + Math.cos(kr) * 4}
              y2={cy + Math.sin(kr) * 4}
              stroke="#0a0b0d"
              strokeWidth="0.6"
            />
          );
        })}
      </g>
    );
  }

  return (
    <div
      className={"dctr-scene " + className}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
      aria-hidden="true"
    >
      {showRoad && (
        <>
          {/* Sky/backdrop subtle vignette */}
          <div className="dctr-backdrop" />
          {/* Road surface */}
          <div className="dctr-road">
            <div className="dctr-asphalt" />
            <div className="dctr-lane" />
            <div className="dctr-shoulder" />
          </div>
          {/* Soft contact shadow */}
          <div className="dctr-shadow" />
        </>
      )}

      {/* The tire itself */}
      <div className="dctr-tire-wrap">
        <svg
          className="dctr-tire-svg"
          viewBox="0 0 400 400"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rubber radial — matte black with subtle sheen */}
            <radialGradient id="rubber" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#1c1c1e" />
              <stop offset="55%" stopColor="#101012" />
              <stop offset="82%" stopColor="#06060a" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>

            {/* Sidewall sheen — angled highlight */}
            <linearGradient id="sidewallSheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="60%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>

            {/* Tread inner ring */}
            <radialGradient id="treadRing" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#000" />
              <stop offset="80%" stopColor="#0a0a0c" />
              <stop offset="100%" stopColor="#1a1a1c" />
            </radialGradient>

            {/* Alloy wheel face — brushed silver */}
            <radialGradient id="alloyFace" cx="0.45" cy="0.4" r="0.65">
              <stop offset="0%" stopColor="#e8eaee" />
              <stop offset="35%" stopColor="#bcc0c6" />
              <stop offset="70%" stopColor="#7e8389" />
              <stop offset="100%" stopColor="#3c3f44" />
            </radialGradient>

            {/* Spoke highlight */}
            <linearGradient id="alloyHi" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5a5e64" />
              <stop offset="40%" stopColor="#d8dce2" />
              <stop offset="60%" stopColor="#f0f2f5" />
              <stop offset="100%" stopColor="#7a7e84" />
            </linearGradient>
            <linearGradient id="alloyEdge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a3c40" />
              <stop offset="100%" stopColor="#9a9ea4" />
            </linearGradient>

            {/* Brake disc */}
            <radialGradient id="brakeDisc" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#3a3a3a" />
              <stop offset="80%" stopColor="#5a5a5a" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </radialGradient>

            {/* Lug nut highlight */}
            <radialGradient id="lugHi" cx="0.35" cy="0.3" r="0.6">
              <stop offset="0%" stopColor="#cfd2d6" />
              <stop offset="60%" stopColor="#5e6166" />
              <stop offset="100%" stopColor="#1a1c20" />
            </radialGradient>

            {/* Hub cap */}
            <radialGradient id="hubCap" cx="0.4" cy="0.35" r="0.7">
              <stop offset="0%" stopColor="#2a2c30" />
              <stop offset="70%" stopColor="#0e0f12" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>

            {/* Sidewall text path — circular */}
            <path
              id="sidewallTextPath"
              d="M 200 200 m -158 0 a 158 158 0 1 1 316 0"
              fill="none"
            />
            <path
              id="sidewallTextPathBottom"
              d="M 200 200 m -158 0 a 158 158 0 1 0 316 0"
              fill="none"
            />
          </defs>

          {/* ── Outer rubber (the tire body) ── */}
          <circle cx="200" cy="200" r="195" fill="url(#rubber)" />

          {/* sidewall sheen overlay */}
          <circle
            cx="200"
            cy="200"
            r="195"
            fill="url(#sidewallSheen)"
            opacity="0.6"
          />

          {/* sidewall outer bevel ring */}
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            stroke="#2a2a2c"
            strokeWidth="0.6"
            opacity="0.7"
          />
          <circle
            cx="200"
            cy="200"
            r="172"
            fill="none"
            stroke="#1a1a1c"
            strokeWidth="0.6"
            opacity="0.6"
          />

          {/* ── Sidewall typography ── */}
          {/* Top arc — MICHELIN, large */}
          <text
            fill="#3a3a3c"
            fontSize="14"
            fontWeight="700"
            letterSpacing="3"
            fontFamily="Inter Tight, Inter, sans-serif"
          >
            <textPath href="#sidewallTextPath" startOffset="50%" textAnchor="middle">
              MICHELIN
            </textPath>
          </text>
          {/* faint shadow underneath for raised-letter effect */}
          <text
            fill="rgba(0,0,0,0.6)"
            fontSize="14"
            fontWeight="700"
            letterSpacing="3"
            fontFamily="Inter Tight, Inter, sans-serif"
            transform="translate(0.6, 0.6)"
          >
            <textPath href="#sidewallTextPath" startOffset="50%" textAnchor="middle">
              MICHELIN
            </textPath>
          </text>

          {/* Bottom arc — spec text */}
          <text
            fill="#2a2a2c"
            fontSize="7"
            fontWeight="600"
            letterSpacing="2"
            fontFamily="Inter, sans-serif"
          >
            <textPath
              href="#sidewallTextPathBottom"
              startOffset="50%"
              textAnchor="middle"
            >
              225/45 R17 · PRIMACY 4 · TUBELESS
            </textPath>
          </text>

          {/* small DOT marker */}
          <g transform="rotate(135 200 200)">
            <text
              x="200"
              y="32"
              textAnchor="middle"
              fill="#2a2a2c"
              fontSize="5"
              fontWeight="600"
              letterSpacing="1.5"
              fontFamily="Inter, sans-serif"
            >
              DOT · 4823
            </text>
          </g>

          {/* ── Tread band ── */}
          <circle cx="200" cy="200" r="170" fill="url(#treadRing)" />
          {/* tread blocks */}
          <g>{treadBlocks}</g>
          {/* center groove ring */}
          <circle
            cx="200"
            cy="200"
            r="148"
            fill="none"
            stroke="#000"
            strokeWidth="2"
            opacity="0.95"
          />
          {/* inner tread shadow ring (transition into rim) */}
          <circle cx="200" cy="200" r="144" fill="#06060a" />

          {/* ── Inner barrel (deep shadow inside the wheel well) ── */}
          <circle cx="200" cy="200" r="138" fill="#000" />
          <circle
            cx="200"
            cy="200"
            r="138"
            fill="none"
            stroke="#1c1c20"
            strokeWidth="0.8"
          />

          {/* ── Brake disc behind the spokes ── */}
          <circle cx="200" cy="200" r="118" fill="url(#brakeDisc)" />
          {/* disc vent slots */}
          {Array.from({ length: 32 }).map((_, i) => {
            const a = (i / 32) * 360;
            return (
              <rect
                key={`vent-${i}`}
                x="199"
                y="92"
                width="2"
                height="14"
                fill="#1a1a1a"
                transform={`rotate(${a} 200 200)`}
              />
            );
          })}
          {/* brake caliper hint — peek behind on one side */}
          <path
            d="M 80 200 a 120 120 0 0 1 14 -60 L 102 144 a 110 110 0 0 0 -12 56 z"
            fill="#7a1a1a"
            opacity="0.55"
          />
          <path
            d="M 80 200 a 120 120 0 0 1 14 -60 L 102 144 a 110 110 0 0 0 -12 56 z"
            fill="none"
            stroke="#3a0808"
            strokeWidth="0.6"
            opacity="0.7"
          />

          {/* ── Alloy wheel face ── */}
          {/* outer lip / barrel */}
          <circle cx="200" cy="200" r="132" fill="url(#alloyFace)" />
          <circle
            cx="200"
            cy="200"
            r="132"
            fill="none"
            stroke="#2c2e32"
            strokeWidth="0.8"
          />
          {/* inner barrel cut */}
          <circle cx="200" cy="200" r="118" fill="#0a0a0c" />
          {/* spokes */}
          <g>{spokes}</g>
          {/* inner hub disc */}
          <circle cx="200" cy="200" r="50" fill="url(#alloyFace)" />
          <circle
            cx="200"
            cy="200"
            r="50"
            fill="none"
            stroke="#2c2e32"
            strokeWidth="0.6"
          />
          {/* lug nuts */}
          <g>{lugs}</g>
          {/* hub cap */}
          <circle cx="200" cy="200" r="22" fill="url(#hubCap)" />
          <circle
            cx="200"
            cy="200"
            r="22"
            fill="none"
            stroke="#3a3c40"
            strokeWidth="0.8"
          />
          <circle cx="200" cy="200" r="14" fill="#0a0a0c" />
          <text
            x="200"
            y="204"
            textAnchor="middle"
            fill="#8BC53F"
            fontSize="10"
            fontWeight="800"
            letterSpacing="1"
            fontFamily="Inter Tight, Inter, sans-serif"
          >
            DC
          </text>

          {/* valve stem */}
          <g transform="rotate(72 200 200)">
            <rect x="198.5" y="118" width="3" height="6" fill="#1a1a1a" />
            <circle cx="200" cy="124" r="2" fill="#2a2a2a" />
          </g>

          {/* spoke speculars / fine highlights */}
          <g opacity="0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const a = (i / 5) * 360;
              return (
                <line
                  key={`sh-${i}`}
                  x1="200"
                  y1="102"
                  x2="200"
                  y2="166"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="0.6"
                  transform={`rotate(${a} 200 200)`}
                />
              );
            })}
          </g>

          {/* outermost rim catchlight (ambient) */}
          <ellipse
            cx="170"
            cy="160"
            rx="40"
            ry="22"
            fill="rgba(255,255,255,0.08)"
            transform="rotate(-30 170 160)"
          />
        </svg>
      </div>
    </div>
  );
}

window.DCTireRealistic = DCTireRealistic;
