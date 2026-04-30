/* global React, DCIcons */
const { useRef, useState } = React;
const { IconArrow, IconArrowUR } = DCIcons;

function PlateInput({ value, onChange, dark }) {
  return (
    <div className="plate" aria-label="Svensk registreringsskylt">
      <div className="plate-flag">
        <svg className="stars" viewBox="-12 -12 24 24" aria-hidden="true">
          {Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const r = 8.5;
            const cx = Math.cos(a) * r;
            const cy = Math.sin(a) * r;
            // 5-point star path
            const star = [];
            for (let k = 0; k < 10; k++) {
              const ang = (k / 10) * Math.PI * 2 - Math.PI / 2;
              const rr = k % 2 === 0 ? 1.4 : 0.55;
              star.push(`${cx + Math.cos(ang) * rr},${cy + Math.sin(ang) * rr}`);
            }
            return <polygon key={i} points={star.join(" ")} fill="#FFCC00"/>;
          })}
        </svg>
        <div className="s">S</div>
      </div>
      <input
        className="plate-input"
        placeholder="ABC 123"
        maxLength={7}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        aria-label="Registreringsnummer"
      />
    </div>
  );
}

function RegSearch({ label = "Hitta däck till din bil", help = "Vi visar produkter som passar din bil — gratis och utan inloggning", dark = false, onSearch }) {
  const [reg, setReg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    console.log('🔍 Search triggered:', { reg, hasOnSearch: !!onSearch });
    if (onSearch && reg.trim()) {
      console.log('🔍 Calling onSearch with:', reg);
      setIsLoading(true);
      try {
        await onSearch(reg);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('❌ Missing onSearch or empty plate');
    }
  };

  return (
    <div>
      <form
        className="regsearch"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}>
        <div className="regsearch-label">{label}</div>
        <PlateInput value={reg} onChange={setReg} dark={dark}/>
        <button
          type="button"
          className="regsearch-cta"
          disabled={isLoading}
          onClick={(e) => {
            console.log('🖱️ Button clicked!');
            e.preventDefault();
            handleSearch();
          }}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Söker...
            </>
          ) : (
            <>
              Sök
              <span className="arrow"><IconArrow size={16}/></span>
            </>
          )}
        </button>
      </form>
      <div className="regsearch-help">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16.5" r=".7" fill="currentColor"/></svg>
        {help}
      </div>
    </div>
  );
}

window.DCRegSearch = RegSearch;
