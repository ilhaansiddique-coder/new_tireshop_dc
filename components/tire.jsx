/* global React */

// Animated tire SVG with tread, motion-blur capable
function AnimatedTire({ size = "100%", style = {}, className = "", spin = true }) {
  const treadCount = 28;
  const treads = Array.from({ length: treadCount }, (_, i) => {
    const angle = (i / treadCount) * 360;
    return (
      <rect key={i}
        x="48.5" y="4" width="3" height="14" rx="1.5"
        fill="#1a1a1a"
        transform={`rotate(${angle} 50 50)`}/>
    );
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style}
         className={className + (spin ? " spin" : "")} aria-hidden>
      <defs>
        <radialGradient id="tireG" cx=".5" cy=".5" r=".5">
          <stop offset="0%" stopColor="#2a2a2a"/>
          <stop offset="78%" stopColor="#0c0c0c"/>
          <stop offset="100%" stopColor="#000"/>
        </radialGradient>
        <radialGradient id="rimG" cx=".4" cy=".35" r=".7">
          <stop offset="0%" stopColor="#f5f5f5"/>
          <stop offset="60%" stopColor="#bcbcbc"/>
          <stop offset="100%" stopColor="#6c6c6c"/>
        </radialGradient>
      </defs>
      {/* outer tire */}
      <circle cx="50" cy="50" r="48" fill="url(#tireG)"/>
      {/* sidewall ring */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="#1f1f1f" strokeWidth="1"/>
      {/* tread */}
      <g>{treads}</g>
      <circle cx="50" cy="50" r="36" fill="#0a0a0a"/>
      {/* rim */}
      <circle cx="50" cy="50" r="30" fill="url(#rimG)"/>
      {/* spokes */}
      {Array.from({length: 5}, (_,i) => {
        const a = (i/5)*360;
        return <rect key={i} x="48.5" y="22" width="3" height="22" rx="1.4"
                     fill="#9a9a9a" transform={`rotate(${a} 50 50)`}/>;
      })}
      <circle cx="50" cy="50" r="9" fill="#2a2a2a"/>
      <circle cx="50" cy="50" r="3" fill="#0a0a0a"/>
      <text x="50" y="51.5" fill="#8BC53F" fontSize="3.6" fontWeight="800"
            textAnchor="middle" fontFamily="Inter Tight, Inter">DC</text>
    </svg>
  );
}

window.DCTire = AnimatedTire;
