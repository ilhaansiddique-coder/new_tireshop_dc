/* global React */

function SearchResults() {
  const [results, setResults] = React.useState(null);
  const [addingToCart, setAddingToCart] = React.useState(null);

  React.useEffect(() => {
    const handleSearchUpdate = () => {
      setResults(window.dcSearchResults || null);
    };

    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const handleAddToCart = (product) => {
    console.log('🛒 Adding to cart:', product.name);
    setAddingToCart(product.id);

    try {
      if (!window.CartManager) {
        console.error('❌ CartManager not available');
        alert('Fel: Varukorgen är inte tillgänglig');
        return;
      }

      window.CartManager.addItem({
        productId: product.productId,
        sku: product.sku,
        name: product.name,
        price: product.price,
        image: product.image,
        supplier_id: product.supplier_id,
        location_id: product.location_id,
        attrs: {
          brand: product.brand,
          dimension: product.dimension
        }
      }, 1);

      console.log('✅ Product added to cart');
      setTimeout(() => setAddingToCart(null), 500);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Fel vid tilläggning till varukorg: ' + error.message);
      setAddingToCart(null);
    }
  };

  if (!results || (!results.car && !results.dimension && results.products.length === 0)) {
    return null;
  }

  return (
    <section className="search-results-section">
      <div className="container">
        {/* Loading State */}
        {window.dcSearchLoading && (
          <div className="search-loading">
            🔍 Söker däck...
          </div>
        )}

        {/* Car Info */}
        {results.car && (
          <div className="car-info-card">
            ✅ <strong>{results.car.make} {results.car.model}</strong> ({results.car.year}) · {results.car.tireDimension}
          </div>
        )}

        {/* Dimension Info */}
        {results.dimension && (
          <div className="car-info-card">
            ✅ <strong>Däckdimension:</strong> {results.dimension}
          </div>
        )}

        {/* Error Message */}
        {results.error && (
          <div className="search-error">
            ❌ {results.error}
          </div>
        )}

        {/* Products Grid */}
        {results.products && results.products.length > 0 && (
          <div className="search-results-content">
            <h2>✓ {results.products.length} däck hittade</h2>
            <div className="products-grid">
              {results.products.map((product) => {
                const imgSrc = product.image?.webshop_thumb || product.image?.thumbnail || product.image?.original;
                return (
                  <div key={product.id} className="product-card">
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="product-name">{product.name}</div>
                    <div className="product-brand">{product.brand}</div>
                    <div className="product-price">{product.priceFormatted}</div>
                    {product.stock > 0 && (
                      <div className="product-stock">✓ {product.stock} i lager</div>
                    )}
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id}
                    >
                      {addingToCart === product.id ? '✓ Tillagd' : 'Lägg i varukorg'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .search-results-section {
          background: white;
          padding: 24px 20px;
          margin-top: 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .search-loading {
          padding: 16px 20px;
          background: #f0f9ff;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: #0c4a6e;
          margin-bottom: 16px;
        }

        .car-info-card {
          padding: 12px 16px;
          background: #e0f2fe;
          border: 2px solid #0ea5e9;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #0c4a6e;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search-error {
          padding: 12px 16px;
          background: #fef2f2;
          border: 2px solid #fca5a5;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #991b1b;
          margin-bottom: 16px;
        }

        .search-results-content h2 {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 20px 0;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 20px;
        }

        .product-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .product-card:hover {
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          transform: translateY(-2px);
        }

        .product-image {
          width: 100%;
          height: 140px;
          object-fit: contain;
          margin-bottom: 12px;
          background: #f9fafb;
          border-radius: 4px;
        }

        .product-name {
          font-weight: 600;
          font-size: 13px;
          color: #1f2937;
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .product-brand {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .product-price {
          color: #8BC53F;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 8px;
        }

        .product-stock {
          font-size: 11px;
          color: #10b981;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 10px 12px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .add-to-cart-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .add-to-cart-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          background: #059669;
        }

        @media (max-width: 768px) {
          .search-results-section {
            padding: 20px;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          }

          .product-image {
            height: 100px;
          }

          .search-results-content h2 {
            font-size: 16px;
            margin-bottom: 16px;
          }

          .car-info-card {
            font-size: 13px;
            padding: 10px 12px;
          }
        }
      `}</style>
    </section>
  );
}

if (typeof window !== 'undefined') {
  window.SearchResults = SearchResults;
}
