/* global React, CartManager, DCIcons */

const { useState, useEffect } = React;
const { IconX, IconShoppingCart, IconMinus, IconPlus, IconTrash } = DCIcons;

function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    return (window.CartManager?.getCart?.()) || { items: [], subtotal: 0 };
  });
  const [lang, setLang] = useState(window.DC_LANG?.current || 'sv');

  useEffect(() => {
    if (!window.CartManager?.subscribe) {
      console.warn('⚠️ CartManager.subscribe not available yet');
      return;
    }

    const unsubscribe = window.CartManager.subscribe((updatedCart) => {
      setCart(updatedCart);
    });

    const handleLanguageChange = () => {
      setLang(window.DC_LANG?.current || 'sv');
    };

    document.addEventListener('languagechange', handleLanguageChange);
    window.addEventListener('dc-language-changed', handleLanguageChange);

    return () => {
      unsubscribe?.();
      document.removeEventListener('languagechange', handleLanguageChange);
      window.removeEventListener('dc-language-changed', handleLanguageChange);
    };
  }, []);

  const translations = {
    sv: {
      cart: 'Varukorg',
      empty: 'Varukorgen är tom',
      items: 'artiklar',
      item: 'artikel',
      subtotal: 'Delsumma',
      checkout: 'Gå till kassa',
      continueShopping: 'Fortsätta handla',
      quantity: 'Antal',
      remove: 'Ta bort',
      total: 'Totalt'
    },
    en: {
      cart: 'Shopping Cart',
      empty: 'Your cart is empty',
      items: 'items',
      item: 'item',
      subtotal: 'Subtotal',
      checkout: 'Proceed to Checkout',
      continueShopping: 'Continue Shopping',
      quantity: 'Quantity',
      remove: 'Remove',
      total: 'Total'
    }
  };

  const t = translations[lang] || translations.sv;
  const itemCount = cart.items?.length || 0;
  const cartCount = window.CartManager?.getCartCount?.() || 0;

  const handleQuantityChange = (item, newQuantity) => {
    window.CartManager?.updateQuantity?.(item.id, item.supplier_id, item.location_id, newQuantity);
  };

  const handleRemoveItem = (item) => {
    window.CartManager?.removeItem?.(item.id, item.supplier_id, item.location_id);
  };

  const handleCheckout = () => {
    setIsOpen(false);
    window.location.href = '/checkout';
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

  return (
    <>
      {/* Cart Icon Button */}
      <button
        className="cart-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.cart}
        title={t.cart}
      >
        <IconShoppingCart size={24} />
        {cartCount > 0 && (
          <span className="cart-badge">{cartCount}</span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="cart-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <h2>{t.cart}</h2>
          <button
            className="cart-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
          >
            <IconX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {itemCount === 0 ? (
            <div className="cart-empty">
              <IconShoppingCart size={48} />
              <p>{t.empty}</p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="cart-items">
                {cart.items.map((item, idx) => (
                  <div key={idx} className="cart-item">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="cart-item-image" />
                    )}

                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">{formatPrice(item.price)}</p>
                      {item.attrs && Object.keys(item.attrs).length > 0 && (
                        <div className="cart-item-attrs">
                          {item.attrs.dimension && (
                            <span className="attr">{item.attrs.dimension}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity-control">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <IconMinus size={16} />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <IconPlus size={16} />
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item)}
                        aria-label={t.remove}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="cart-totals">
                <div className="totals-row">
                  <span>{t.subtotal}</span>
                  <span className="amount">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="totals-row total">
                  <span>{t.total}</span>
                  <span className="amount">{formatPrice(cart.subtotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!window.CartManager?.isEmpty?.() && (
          <div className="cart-footer">
            <button
              className="btn btn-checkout"
              onClick={handleCheckout}
            >
              {t.checkout}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setIsOpen(false)}
            >
              {t.continueShopping}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .cart-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: all var(--t-fast);
          color: var(--ink);
        }

        .cart-icon-btn:hover {
          background: var(--bg-alt);
          border-color: var(--accent);
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: var(--accent);
          color: var(--accent-ink);
          font-size: 12px;
          font-weight: 700;
          border-radius: 10px;
        }

        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cart-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 400px;
          height: 100vh;
          background: var(--bg);
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          z-index: 999;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          transform: translateX(100%);
          overflow: hidden;
        }

        .cart-drawer.open {
          transform: translateX(0);
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
        }

        .cart-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .cart-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .cart-close-btn:hover {
          background: var(--color-hover, #f3f4f6);
        }

        .cart-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          color: #6b7280;
          text-align: center;
        }

        .cart-empty svg {
          opacity: 0.4;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: var(--r-sm);
          background: var(--bg-alt);
        }

        .cart-item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          background: var(--bg);
          flex-shrink: 0;
        }

        .cart-item-details {
          flex: 1;
          min-width: 0;
        }

        .cart-item-details h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cart-item-price {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--accent);
        }

        .cart-item-attrs {
          margin-top: 6px;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .cart-item-attrs .attr {
          display: inline-block;
          padding: 2px 6px;
          background: var(--bg);
          border: 1px solid var(--line);
          border-radius: 3px;
          font-size: 11px;
          color: var(--ink-4);
        }

        .cart-item-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid var(--line);
          border-radius: 4px;
          background: var(--bg);
        }

        .quantity-control button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--ink-4);
          transition: color var(--t-fast);
        }

        .quantity-control button:hover {
          color: var(--accent);
        }

        .quantity-value {
          min-width: 24px;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink);
        }

        .remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid var(--danger);
          background: rgba(197, 57, 46, 0.08);
          color: var(--danger);
          border-radius: 4px;
          cursor: pointer;
          transition: all var(--t-fast);
        }

        .remove-btn:hover {
          background: var(--danger);
          color: white;
        }

        .cart-totals {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--ink);
        }

        .totals-row.total {
          font-size: 16px;
          font-weight: 600;
          color: var(--accent);
        }

        .cart-footer {
          padding: 24px;
          border-top: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-checkout {
          background: var(--accent);
          color: var(--accent-ink);
          border: none;
          padding: 12px 24px;
          border-radius: var(--r-sm);
          font-weight: 600;
          cursor: pointer;
          transition: opacity var(--t-fast);
        }

        .btn-checkout:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--accent);
          padding: 12px 24px;
          border-radius: var(--r-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--t-fast);
        }

        .btn-secondary:hover {
          background: var(--accent);
          color: var(--accent-ink);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .cart-drawer {
            max-width: 100%;
            width: 100%;
          }

          .cart-header {
            padding: 16px;
          }

          .cart-content {
            padding: 16px;
          }

          .cart-footer {
            padding: 16px;
          }

          .cart-item {
            flex-direction: column;
            gap: 8px;
          }

          .cart-item-image {
            width: 100%;
            height: auto;
            aspect-ratio: 16/9;
          }

          .cart-item-controls {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .cart-drawer {
            max-width: 100%;
          }

          .cart-header h2 {
            font-size: 18px;
          }

          .quantity-control button {
            width: 20px;
            height: 20px;
          }

          .remove-btn {
            width: 24px;
            height: 24px;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

if (typeof window !== 'undefined') {
  window.DCCartDrawer = CartDrawer;
}
