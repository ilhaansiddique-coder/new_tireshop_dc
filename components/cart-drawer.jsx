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
    window.location.href = '/checkout.html';
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
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cart-icon-btn:hover {
          background: var(--color-hover, #f3f4f6);
          border-color: var(--color-accent, #10b981);
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
          background: var(--color-accent, #10b981);
          color: white;
          font-size: 12px;
          font-weight: 600;
          border-radius: 10px;
        }

        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          animation: fadeIn 0.2s ease;
        }

        .cart-drawer {
          position: fixed;
          top: 0;
          right: -100%;
          width: 100%;
          max-width: 400px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          transition: right 0.3s ease;
          overflow: hidden;
        }

        .cart-drawer.open {
          right: 0;
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
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          background: var(--color-bg-alt, #f9fafb);
        }

        .cart-item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          background: white;
        }

        .cart-item-details {
          flex: 1;
          min-width: 0;
        }

        .cart-item-details h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cart-item-price {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-accent, #10b981);
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
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 3px;
          font-size: 11px;
          color: #6b7280;
        }

        .cart-item-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 4px;
          background: white;
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
          color: #6b7280;
          transition: color 0.2s;
        }

        .quantity-control button:hover {
          color: var(--color-accent, #10b981);
        }

        .quantity-value {
          min-width: 24px;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
        }

        .remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid #fee2e2;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .remove-btn:hover {
          background: #fecaca;
          border-color: #fca5a5;
        }

        .cart-totals {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--color-border, #e5e7eb);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .totals-row.total {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-accent, #10b981);
        }

        .cart-footer {
          padding: 24px;
          border-top: 1px solid var(--color-border, #e5e7eb);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-checkout {
          background: var(--color-accent, #10b981);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .btn-checkout:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: transparent;
          color: var(--color-accent, #10b981);
          border: 1px solid var(--color-accent, #10b981);
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--color-accent, #10b981);
          color: white;
        }

        @media (max-width: 768px) {
          .cart-drawer {
            max-width: 100%;
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
