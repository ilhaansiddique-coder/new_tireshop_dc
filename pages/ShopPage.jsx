/* global React, CartManager, DCProductCard */

const { useState, useEffect } = React;

const translations = {
  sv: {
    title: 'Shop',
    desc: 'Bläddra och lägg produkter i varukorgen',
    search: 'Sök däck efter registreringsnummer',
    plate: 'Registreringsnummer',
    search_btn: 'Sök',
    searching: 'Söker...',
    car_info: 'Fordon:',
    tires_found: 'Däck hittade:',
    season: 'Säsong:',
    summer: 'Sommar',
    winter: 'Vinter',
    all_season: 'Årets rond',
    all_types: 'Alla typer',
    loading: 'Laddar däck...',
    error: 'Det gick inte att ladda däck. Försök igen senare.',
    error_car: 'Fordonet hittades inte. Försök med ett annat registreringsnummer.',
    no_tires: 'Inga däck hittade för denna storlek.',
    manual_search: 'Sök efter däckstorlek istället',
    tire_width: 'Bredd (mm)',
    tire_ratio: 'Höjd (%)',
    tire_diameter: 'Fälgdiameter (tum)',
    tire_search_btn: 'Sök däck'
  },
  en: {
    title: 'Shop',
    desc: 'Browse and add products to your cart',
    search: 'Search tires by license plate',
    plate: 'License plate',
    search_btn: 'Search',
    searching: 'Searching...',
    car_info: 'Vehicle:',
    tires_found: 'Tires found:',
    season: 'Season:',
    summer: 'Summer',
    winter: 'Winter',
    all_season: 'All-season',
    all_types: 'All types',
    loading: 'Loading tires...',
    error: 'Failed to load tires. Please try again later.',
    error_car: 'Vehicle not found. Try another license plate.',
    no_tires: 'No tires found for this size.',
    manual_search: 'Search by tire size instead',
    tire_width: 'Width (mm)',
    tire_ratio: 'Height (%)',
    tire_diameter: 'Rim diameter (inch)',
    tire_search_btn: 'Search tires'
  }
};

function ShopPage() {
  const [lang, setLang] = useState(window.DC_LANG?.current || 'sv');
  const [plate, setPlate] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [carInfo, setCarInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [frictionFilter, setFrictionFilter] = useState('');  // '' | 'nordic' | 'european' (only when winter)
  const [brandFilter, setBrandFilter] = useState('');
  const [speedFilter, setSpeedFilter] = useState('');
  const [loadFilter, setLoadFilter] = useState('');
  const [rrFilter, setRrFilter] = useState('');         // Rolling resistance grade
  const [wgFilter, setWgFilter] = useState('');         // Wet grip grade
  const [maxNoise, setMaxNoise] = useState('');
  const [propXL, setPropXL] = useState(false);
  const [propRunflat, setPropRunflat] = useState(false);
  const [propSilent, setPropSilent] = useState(false);
  const [propEV, setPropEV] = useState(false);
  const [propStudded, setPropStudded] = useState(false);
  const [propSnow, setPropSnow] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [width, setWidth] = useState('');
  const [ratio, setRatio] = useState('');
  const [diameter, setDiameter] = useState('');
  const [dimension, setDimension] = useState('');
  const [useDimensionString, setUseDimensionString] = useState(false);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLang(window.DC_LANG?.current || 'sv');
    };

    document.addEventListener('languagechange', handleLanguageChange);
    window.addEventListener('dc-language-changed', handleLanguageChange);

    return () => {
      document.removeEventListener('languagechange', handleLanguageChange);
      window.removeEventListener('dc-language-changed', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    document.title = `${translations[lang].title} — Däckcentrum`;
  }, [lang]);

  useEffect(() => {
    // Hide page loader when ShopPage mounts
    if (window.hidePageLoader) {
      window.hidePageLoader();
    }
  }, []);

  useEffect(() => {
    // Check for plate in URL query parameter
    const params = new URLSearchParams(window.location.search);
    const plateParam = params.get('plate');
    if (plateParam) {
      setPlate(plateParam.toUpperCase());
    }
  }, []);

  const performSearch = async (searchPlate) => {
    if (!searchPlate || !searchPlate.trim()) return;

    setSearchLoading(true);
    setError(null);
    setCarInfo(null);
    setProducts([]);
    setShowManualSearch(false);

    try {
      const response = await fetch(`/api/products?plate=${encodeURIComponent(searchPlate)}`);

      if (!response.ok) {
        throw new Error(translations[lang].error_car);
      }

      const data = await response.json();

      if (data.car) {
        setCarInfo(data.car);
      }

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        setError(translations[lang].no_tires);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || translations[lang].error_car);
      setShowManualSearch(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const parseDimension = (input) => {
    if (!input || !input.trim()) return null;
    const cleaned = input.replace(/\s+/g, '').toUpperCase();
    const patterns = [
      /^(\d+)\/(\d+)\s*[Rr](\d+)$/, // 225/50 R16
      /^(\d+)\/(\d+)\/(\d+)$/, // 225/50/16
      /^(\d+)-(\d+)-(\d+)$/, // 225-50-16
    ];
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        return { width: match[1], ratio: match[2], diameter: match[3] };
      }
    }
    return null;
  };

  const performManualSearch = async (e) => {
    e.preventDefault();
    if (!width || !ratio || !diameter) return;

    setSearchLoading(true);
    setError(null);
    setProducts([]);

    try {
      const response = await fetch(
        `/api/products?width=${encodeURIComponent(width)}&ratio=${encodeURIComponent(ratio)}&diameter=${encodeURIComponent(diameter)}`
      );

      if (!response.ok) {
        throw new Error(translations[lang].error);
      }

      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        setShowManualSearch(false);
      } else {
        setError(translations[lang].no_tires);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || translations[lang].error);
    } finally {
      setSearchLoading(false);
    }
  };

  const performDimensionSearch = async (e) => {
    e.preventDefault();
    const parsed = parseDimension(dimension);
    if (!parsed) {
      setError(lang === 'sv' ? 'Ogiltig format. Använd t.ex. 225/50 R16' : 'Invalid format. Use e.g. 225/50 R16');
      return;
    }

    setSearchLoading(true);
    setError(null);
    setProducts([]);

    try {
      const response = await fetch(
        `/api/products?width=${encodeURIComponent(parsed.width)}&ratio=${encodeURIComponent(parsed.ratio)}&diameter=${encodeURIComponent(parsed.diameter)}`
      );

      if (!response.ok) {
        throw new Error(translations[lang].error);
      }

      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        setUseDimensionString(false);
      } else {
        setError(translations[lang].no_tires);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || translations[lang].error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Auto-search when plate is set from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('plate') && plate) {
      performSearch(plate);
    }
  }, [plate, lang]);

  const handlePlateSearch = async (e) => {
    e.preventDefault();
    performSearch(plate);
  };

  // Available filter options derived from current results
  const availableBrands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const availableSpeeds = [...new Set(products.map(p => p.speedIndex).filter(Boolean))].sort();
  const availableLoads = [...new Set(products.map(p => p.loadIndex).filter(Boolean))].sort();
  const grades = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  // Match season by name (works across compoundType.id values like 4 = "Vinter (nordisk)")
  const seasonMatches = (p) => {
    if (!seasonFilter) return true;
    const name = (p.seasonType || '').toLowerCase();
    if (seasonFilter === 1) return /sommar|summer/.test(name);
    if (seasonFilter === 2) return /vinter|winter/.test(name);
    if (seasonFilter === 3) return /helår|all.?season/.test(name);
    return p.seasonTypeId === seasonFilter;
  };

  const frictionMatches = (p) => {
    if (!frictionFilter || seasonFilter !== 2) return true;
    const name = (p.seasonType || '').toLowerCase();
    if (frictionFilter === 'nordic') return /nordisk|nordic/.test(name);
    if (frictionFilter === 'european') return /vinter|winter/.test(name) && !/nordisk|nordic/.test(name);
    return true;
  };

  const filteredProducts = products.filter(p => {
    if (!seasonMatches(p)) return false;
    if (!frictionMatches(p)) return false;
    if (brandFilter && p.brand !== brandFilter) return false;
    if (speedFilter && p.speedIndex !== speedFilter) return false;
    if (loadFilter && p.loadIndex !== loadFilter) return false;
    if (rrFilter && p.rollingResistance !== rrFilter) return false;
    if (wgFilter && p.wetGrip !== wgFilter) return false;
    if (maxNoise && p.noiseDecibel && Number(p.noiseDecibel) > Number(maxNoise)) return false;
    if (propXL && !p.isEnforced) return false;
    if (propRunflat && !p.isRunflat) return false;
    if (propSilent && !p.isSilence) return false;
    if (propEV && !p.isElectricVehicle) return false;
    if (propStudded && !p.isStudded) return false;
    if (propSnow && !p.snowGrip) return false;
    return true;
  });

  const clearAllFilters = () => {
    setSeasonFilter(null);
    setFrictionFilter('');
    setBrandFilter('');
    setSpeedFilter('');
    setLoadFilter('');
    setRrFilter('');
    setWgFilter('');
    setMaxNoise('');
    setPropXL(false);
    setPropRunflat(false);
    setPropSilent(false);
    setPropEV(false);
    setPropStudded(false);
    setPropSnow(false);
  };

  const t = translations[lang] || translations.sv;

  return (
    <div className="shop-root" style={{ maxWidth: '1320px', margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .shop-root { padding: 20px 12px !important; }
          .shop-root .shop-search { padding: 20px !important; }
          .shop-root .shop-search h2 { font-size: 18px !important; }
          .shop-root .shop-search form { flex-direction: column !important; gap: 8px !important; }
          .shop-root .shop-search button { width: 100% !important; }
          .shop-root .filter-panel { padding: 14px !important; }
          .shop-root .filter-panel .filter-top-row { gap: 14px !important; }
          .shop-root .filter-panel select { width: 100% !important; min-width: 0 !important; }
          .shop-root .filter-panel .friction-tile { width: 64px !important; height: 64px !important; font-size: 11px !important; }
          .shop-root .filter-panel .grade-row { flex-wrap: wrap !important; }
          .shop-root .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
        @media (max-width: 480px) {
          .shop-root { padding: 16px 8px !important; }
          .shop-root .filter-panel .friction-tile { width: 56px !important; height: 56px !important; }
          .shop-root .product-grid { gap: 8px !important; }
        }
      `}</style>
      {/* Search Section */}
      <div className="shop-search" style={{
        background: '#f3f4f6',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '40px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: 0, marginBottom: '20px' }}>
          {t.search}
        </h2>
        <form onSubmit={handlePlateSearch} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder={t.plate}
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              flex: 1
            }}
          />
          <button
            type="submit"
            disabled={searchLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#8BC53F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: searchLoading ? 'not-allowed' : 'pointer',
              opacity: searchLoading ? 0.7 : 1
            }}
          >
            {searchLoading ? t.searching : t.search_btn}
          </button>
        </form>
      </div>

      {/* Car Info */}
      {carInfo && (
        <div style={{
          background: '#e0f2fe',
          border: '1px solid #bae6fd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          <strong>{t.car_info}</strong> {carInfo.make} {carInfo.model} ({carInfo.year})
          {carInfo.tireDimension && ` · ${carInfo.tireDimension}`}
        </div>
      )}

      {/* Filters Panel */}
      {products.length > 0 && (() => {
        const seasonBtn = (id, label, emoji) => (
          <button
            onClick={() => {
              setSeasonFilter(id);
              if (id !== 2) setFrictionFilter('');
            }}
            style={{
              padding: '8px 14px',
              border: seasonFilter === id ? '2px solid #8BC53F' : '1px solid #d1d5db',
              backgroundColor: seasonFilter === id ? '#f0fdf4' : 'white',
              borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
            }}
          >{emoji} {label}</button>
        );

        const frictionTile = (value, label, icon) => (
          <button
            className="friction-tile"
            onClick={() => setFrictionFilter(frictionFilter === value ? '' : value)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '4px', width: '76px', height: '76px',
              border: frictionFilter === value ? '2px solid #1f2937' : '1px solid #d1d5db',
              background: frictionFilter === value ? '#1f2937' : 'white',
              color: frictionFilter === value ? 'white' : '#374151',
              borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px', fontWeight: '600',
              position: 'relative',
            }}
          >
            {frictionFilter === value && <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '12px' }}>✓</span>}
            <span style={{ fontSize: '24px' }}>{icon}</span>
            {label}
          </button>
        );

        const dubbTile = (
          <button
            className="friction-tile"
            onClick={() => setPropStudded(!propStudded)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '4px', width: '76px', height: '76px',
              border: propStudded ? '2px solid #1f2937' : '1px solid #d1d5db',
              background: propStudded ? '#1f2937' : 'white',
              color: propStudded ? 'white' : '#9ca3af',
              borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px', fontWeight: '600',
              position: 'relative',
            }}
          >
            {propStudded && <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '12px' }}>✓</span>}
            <span style={{ fontSize: '20px' }}>▲</span>
            {lang === 'sv' ? 'Dubb' : 'Studded'}
          </button>
        );
        const gradeBtn = (filter, setFilter, grade) => (
          <button
            key={grade}
            onClick={() => setFilter(filter === grade ? '' : grade)}
            style={{
              width: '32px', height: '32px',
              border: filter === grade ? '2px solid #8BC53F' : '1px solid #d1d5db',
              background: filter === grade ? '#1f2937' : 'white',
              color: filter === grade ? 'white' : '#1f2937',
              borderRadius: '4px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '700',
            }}
          >{grade}</button>
        );
        const propBox = (checked, setChecked, label) => (
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
            {label}
          </label>
        );
        const sectionLabel = { fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' };
        return (
          <div className="filter-panel" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
            {/* Top row: season + brand + clear */}
            <div className="filter-top-row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <div style={sectionLabel}>{t.season || 'Däcktyp'}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {seasonBtn(null, t.all_types || 'Alla', '')}
                  {seasonBtn(1, t.summer || 'Sommar', '☀️')}
                  {seasonBtn(2, t.winter || 'Vinter', '❄️')}
                  {seasonBtn(3, t.all_season || 'Helår', '🍂')}
                </div>
              </div>
              {seasonFilter === 2 && (
                <>
                  <div>
                    <div style={sectionLabel}>{lang === 'sv' ? 'Friktion' : 'Friction'}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {frictionTile('nordic', lang === 'sv' ? 'Nordisk' : 'Nordic', '🇳🇴')}
                      {frictionTile('european', lang === 'sv' ? 'Europeisk' : 'European', '🇪🇺')}
                    </div>
                  </div>
                  <div>
                    <div style={sectionLabel}>{lang === 'sv' ? 'Dubb' : 'Studded'}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {dubbTile}
                    </div>
                  </div>
                </>
              )}
              <div>
                <div style={sectionLabel}>{lang === 'sv' ? 'Varumärke' : 'Brand'}</div>
                <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minWidth: '160px', background: 'white' }}>
                  <option value="">{lang === 'sv' ? 'Alla' : 'All'}</option>
                  {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <button onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', background: 'white', textDecoration: 'underline' }}>
                {showAdvanced
                  ? (lang === 'sv' ? 'Visa färre filter ▴' : 'Show fewer filters ▴')
                  : (lang === 'sv' ? 'Visa fler filter ▾' : 'Show more filters ▾')}
              </button>
              <button onClick={clearAllFilters}
                style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', background: 'white' }}>
                {lang === 'sv' ? 'Rensa filter' : 'Clear filters'}
              </button>
            </div>

            {showAdvanced && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <div>
                  <div style={sectionLabel}>{lang === 'sv' ? 'Hastighetsindex' : 'Speed index'}</div>
                  <select value={speedFilter} onChange={e => setSpeedFilter(e.target.value)}
                    style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', width: '100%', background: 'white' }}>
                    <option value="">{lang === 'sv' ? 'Alla' : 'All'}</option>
                    {availableSpeeds.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div style={sectionLabel}>{lang === 'sv' ? 'Belastningsindex' : 'Load index'}</div>
                  <select value={loadFilter} onChange={e => setLoadFilter(e.target.value)}
                    style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', width: '100%', background: 'white' }}>
                    <option value="">{lang === 'sv' ? 'Alla' : 'All'}</option>
                    {availableLoads.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <div style={sectionLabel}>{lang === 'sv' ? 'Rullmotstånd' : 'Rolling resistance'}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {grades.map(g => gradeBtn(rrFilter, setRrFilter, g))}
                  </div>
                </div>
                <div>
                  <div style={sectionLabel}>{lang === 'sv' ? 'Våtgrepp' : 'Wet grip'}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {grades.map(g => gradeBtn(wgFilter, setWgFilter, g))}
                  </div>
                </div>
                <div>
                  <div style={sectionLabel}>{lang === 'sv' ? 'Bullernivå max (dB)' : 'Max noise (dB)'}</div>
                  <input type="number" value={maxNoise} onChange={e => setMaxNoise(e.target.value)}
                    placeholder={lang === 'sv' ? 'Alla' : 'All'}
                    style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', width: '100%' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={sectionLabel}>{lang === 'sv' ? 'Egenskaper' : 'Properties'}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {propBox(propXL, setPropXL, 'XL')}
                    {propBox(propRunflat, setPropRunflat, lang === 'sv' ? 'Punkteringssäkra' : 'Run-flat')}
                    {propBox(propSilent, setPropSilent, lang === 'sv' ? 'Akustiska däck' : 'Silent')}
                    {propBox(propEV, setPropEV, 'EV')}
                    {propBox(propStudded, setPropStudded, lang === 'sv' ? 'Dubbade' : 'Studded')}
                    {propBox(propSnow, setPropSnow, lang === 'sv' ? '3PMSF (snögrepp)' : '3PMSF (snow)')}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
              {lang === 'sv' ? 'Visar' : 'Showing'} {filteredProducts.length} / {products.length} {lang === 'sv' ? 'produkter' : 'products'}
            </div>
          </div>
        );
      })()}

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fee2e2',
          padding: '20px',
          borderRadius: '8px',
          color: '#991b1b',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Manual Tire Search Fallback */}
      {showManualSearch && error && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: 0, fontSize: '18px', fontWeight: '600' }}>
              {t.manual_search}
            </h3>
            <button
              type="button"
              onClick={() => setUseDimensionString(!useDimensionString)}
              style={{
                padding: '8px 16px',
                border: '1px solid #86efac',
                backgroundColor: 'white',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                color: '#15803d'
              }}
            >
              {useDimensionString ? (lang === 'sv' ? '← Separata fält' : '← Separate fields') : (lang === 'sv' ? 'Enhetlig format →' : 'Unified format →')}
            </button>
          </div>

          {!useDimensionString ? (
            <form onSubmit={performManualSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  {t.tire_width}
                </label>
                <input
                  type="text"
                  placeholder="205"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  {t.tire_ratio}
                </label>
                <input
                  type="text"
                  placeholder="55"
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  {t.tire_diameter}
                </label>
                <input
                  type="text"
                  placeholder="16"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading || !width || !ratio || !diameter}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8BC53F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (searchLoading || !width || !ratio || !diameter) ? 'not-allowed' : 'pointer',
                  opacity: (searchLoading || !width || !ratio || !diameter) ? 0.7 : 1
                }}
              >
                {searchLoading ? t.searching : t.tire_search_btn}
              </button>
            </form>
          ) : (
            <form onSubmit={performDimensionSearch} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  {lang === 'sv' ? 'Däckdimension' : 'Tire Dimension'}
                </label>
                <input
                  type="text"
                  placeholder="225/50 R16"
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading || !dimension}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8BC53F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (searchLoading || !dimension) ? 'not-allowed' : 'pointer',
                  opacity: (searchLoading || !dimension) ? 0.7 : 1,
                  whiteSpace: 'nowrap'
                }}
              >
                {searchLoading ? t.searching : t.tire_search_btn}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className="product-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {filteredProducts.map(product => (
          <DCProductCard
            key={`${product.id}-${product.supplier_id || ''}`}
            product={product}
          />
        ))}
      </div>

      {!products.length && !searchLoading && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          {t.desc}
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.ShopPage = ShopPage;
}
