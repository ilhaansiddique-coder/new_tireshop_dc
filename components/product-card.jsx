/* global React, CartManager, DCIcons */

const { useState } = React;
const { IconShoppingCart, IconCheck } = DCIcons;

/**
 * Product Card Component
 * Displays a product with image, info, and add-to-cart button
 *
 * Props:
 *   product {Object} - Product object from API
 *   onAdd {Function} - Callback when item is added (optional)
 */
function ProductCard({ product, onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [lang, setLang] = React.useState(window.DC_LANG?.current || 'sv');

  const translations = {
    sv: {
      addToCart: 'Lägg i varukorg',
      added: 'Tillagd!',
      inStock: 'I lager',
      outOfStock: 'Slut i lager',
      quantity: 'Lagersaldo'
    },
    en: {
      addToCart: 'Add to Cart',
      added: 'Added!',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      quantity: 'Stock'
    }
  };

  React.useEffect(() => {
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

  const t = translations[lang] || translations.sv;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      window.CartManager?.addItem?.(product, 1);
      setIsAdded(true);

      if (onAdd) {
        onAdd(product);
      }

      // Reset button after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (priceOre) => {
    const priceSek = priceOre / 100;
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(priceSek);
  };

  const inStock = product.stock && product.stock > 0;
  const price = product.price || 0;
  const image = product.image || product.images?.[0];

  return (
    <div className="product-card">
      {image && (
        <div className="product-image">
          <img src={image} alt={product.name || product.description} loading="lazy" />
          {!inStock && <div className="stock-overlay">{t.outOfStock}</div>}
        </div>
      )}

      <div className="product-info">
        <h3 className="product-name">{product.name || product.description}</h3>

        {product.attrs?.dimension && (
          <p className="product-dimension">{product.attrs.dimension}</p>
        )}

        {product.brand?.name && (
          <p className="product-brand">{product.brand.name}</p>
        )}

        {product.model?.name && (
          <p className="product-model">{product.model.name}</p>
        )}

        <div className="product-meta">
          <span className={`stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
            {inStock ? t.inStock : t.outOfStock}
          </span>
          {inStock && product.stock && (
            <span className="quantity">{t.quantity}: {product.stock}</span>
          )}
        </div>

        <div className="product-price">
          {formatPrice(price)}
        </div>

        <button
          className={`product-btn ${isAdded ? 'added' : ''} ${!inStock ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={isAdding || !inStock || isAdded}
        >
          {isAdding ? (
            <>
              <span className="spinner"></span> {lang === 'sv' ? 'Läggs till...' : 'Adding...'}
            </>
          ) : isAdded ? (
            <>
              <IconCheck size={18} /> {t.added}
            </>
          ) : (
            <>
              <IconShoppingCart size={18} /> {t.addToCart}
            </>
          )}
        </button>
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
          height: 100%;
        }

        .product-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: var(--color-accent, #10b981);
        }

        .product-image {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .product-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-name {
          margin: 0 0 8px 0;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.3;
          color: var(--color-text, #1f2937);
        }

        .product-dimension {
          margin: 0 0 4px 0;
          font-size: 13px;
          color: #6b7280;
        }

        .product-brand {
          margin: 0 0 4px 0;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .product-model {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #9ca3af;
        }

        .product-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
          font-size: 12px;
        }

        .stock-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .stock-badge.in-stock {
          background: #f0fdf4;
          color: #166534;
        }

        .stock-badge.out-of-stock {
          background: #fef2f2;
          color: #991b1b;
        }

        .quantity {
          color: #6b7280;
        }

        .product-price {
          margin-bottom: 12px;
          font-size: 18px;
          font-weight: 700;
          color: var(--color-accent, #10b981);
        }

        .product-btn {
          padding: 10px 16px;
          border: 1px solid var(--color-accent, #10b981);
          background: var(--color-accent, #10b981);
          color: white;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          margin-top: auto;
        }

        .product-btn:hover:not(:disabled) {
          background: #059669;
          border-color: #059669;
        }

        .product-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .product-btn.added {
          background: var(--color-accent, #10b981);
          border-color: var(--color-accent, #10b981);
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.DCProductCard = ProductCard;
}
