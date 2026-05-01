/* global React, DCIcons */
const { useRef, useState } = React;
const { IconArrow } = DCIcons;

function TireDimensionInput({ value, onChange, placeholder = "225/50 R16", dark }) {
  return (
    <input
      type="text"
      className="tire-dimension-input"
      placeholder={placeholder}
      maxLength={20}
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      aria-label="Däckdimension"
      title="Format: 225/50 R16 eller 225/50/16"
    />
  );
}

function parseTireDimension(input) {
  if (!input || !input.trim()) return null;

  const cleaned = input.replace(/\s+/g, '').toUpperCase();

  // Support formats: 225/50 R16, 225/50/16, 225-50-16, 225 50 16
  const patterns = [
    /^(\d+)\/(\d+)\s*[Rr](\d+)$/, // 225/50 R16
    /^(\d+)\/(\d+)\/(\d+)$/, // 225/50/16
    /^(\d+)-(\d+)-(\d+)$/, // 225-50-16
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      return {
        width: match[1],
        ratio: match[2],
        diameter: match[3],
        formatted: `${match[1]}/${match[2]} R${match[3]}`
      };
    }
  }

  return null;
}

function TireDimensionSearch({
  label = "Sök på däckdimension",
  help = "Ange dimension i format 225/50 R16",
  dark = false,
  onSearch
}) {
  const [dimension, setDimension] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");

    const parsed = parseTireDimension(dimension);
    if (!parsed) {
      setError("Ogiltig format. Använd t.ex. 225/50 R16");
      return;
    }

    if (onSearch) {
      console.log('🔍 Tire dimension search:', parsed);
      setIsLoading(true);
      try {
        await onSearch(parsed);
      } catch (err) {
        setError(err.message || "Sökningen misslyckades");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <form
        className="tire-dimension-search"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}>
        <div className="tire-search-label">{label}</div>
        <TireDimensionInput value={dimension} onChange={setDimension} dark={dark}/>
        <button
          type="button"
          className="tire-search-cta"
          disabled={isLoading}
          onClick={(e) => {
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
      {error && <div className="tire-search-error">{error}</div>}
      <div className="tire-search-help">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16.5" r=".7" fill="currentColor"/></svg>
        {help}
      </div>
    </div>
  );
}

window.DCTireDimensionSearch = TireDimensionSearch;
window.parseTireDimension = parseTireDimension;
