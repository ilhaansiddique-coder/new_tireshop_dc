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
    no_tires: 'Inga däck hittade för denna storlek.'
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
    no_tires: 'No tires found for this size.'
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

  const handlePlateSearch = async (e) => {
    e.preventDefault();
    if (!plate.trim()) return;

    setSearchLoading(true);
    setError(null);
    setCarInfo(null);
    setProducts([]);

    try {
      const response = await fetch(`/api/products?plate=${encodeURIComponent(plate)}`);

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
    } finally {
      setSearchLoading(false);
    }
  };

  const filteredProducts = seasonFilter
    ? products.filter(p => p.seasonTypeId === seasonFilter)
    : products;

  const t = translations[lang] || translations.sv;

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Search Section */}
      <div style={{
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

      {/* Season Filter */}
      {products.length > 0 && (
        <div style={{ marginBottom: '30px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{t.season}:</span>
          <button
            onClick={() => setSeasonFilter(null)}
            style={{
              padding: '8px 16px',
              border: seasonFilter === null ? '2px solid #8BC53F' : '1px solid #d1d5db',
              backgroundColor: seasonFilter === null ? '#f0fdf4' : 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t.all_types}
          </button>
          <button
            onClick={() => setSeasonFilter(1)}
            style={{
              padding: '8px 16px',
              border: seasonFilter === 1 ? '2px solid #8BC53F' : '1px solid #d1d5db',
              backgroundColor: seasonFilter === 1 ? '#f0fdf4' : 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ☀️ {t.summer}
          </button>
          <button
            onClick={() => setSeasonFilter(2)}
            style={{
              padding: '8px 16px',
              border: seasonFilter === 2 ? '2px solid #8BC53F' : '1px solid #d1d5db',
              backgroundColor: seasonFilter === 2 ? '#f0fdf4' : 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ❄️ {t.winter}
          </button>
          <button
            onClick={() => setSeasonFilter(3)}
            style={{
              padding: '8px 16px',
              border: seasonFilter === 3 ? '2px solid #8BC53F' : '1px solid #d1d5db',
              backgroundColor: seasonFilter === 3 ? '#f0fdf4' : 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🍂 {t.all_season}
          </button>
        </div>
      )}

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

      {/* Products Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {filteredProducts.map(product => (
          <DCProductCard
            key={`${product.id}-${product.supplier_id || ''}`}
            product={{
              productId: product.id,
              name: product.name,
              description: product.brand,
              price: product.price,
              stock: product.stock,
              image: product.image,
              attrs: {
                dimension: product.dimension,
                brand: product.brand,
                type: product.seasonType
              }
            }}
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
