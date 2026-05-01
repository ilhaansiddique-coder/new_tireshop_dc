/* global React, DCIcons */

const { IconX, IconTrash, IconMinus, IconPlus } = DCIcons;

function MiniCart() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [cart, setCart] = React.useState({ items: [], subtotal: 0 });

  React.useEffect(() => {
    if (!window.CartManager?.subscribe) return;

    const unsubscribe = window.CartManager.subscribe((updatedCart) => {
      setCart(updatedCart);
    });

    return () => unsubscribe?.();
  }, []);

  const itemCount = cart.items?.length || 0;
  const isEmpty = itemCount === 0;

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) return;
    window.CartManager?.updateQuantity?.(item.id, item.supplier_id, item.location_id, newQuantity);
  };

  const handleRemoveItem = (item) => {
    window.CartManager?.removeItem?.(item.id, item.supplier_id, item.location_id);
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
      <button
        className="cart-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isEmpty ? 'Varukorg är tom' : `${itemCount} artikel i varukorg`}
        aria-label="Varukorg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </button>

      {isOpen && (
        <div
          className="cart-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <h2>Varukorg</h2>
          <button
            className="cart-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Stäng varukorg"
          >
            <IconX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {isEmpty ? (
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p>Varukorgen är tom</p>
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
                          aria-label="Minska antal"
                        >
                          <IconMinus size={16} />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          aria-label="Öka antal"
                        >
                          <IconPlus size={16} />
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item)}
                        aria-label="Ta bort från varukorg"
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
                  <span>Delsumma</span>
                  <span className="amount">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="totals-row total">
                  <span>Totalt</span>
                  <span className="amount">{formatPrice(cart.subtotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="cart-footer">
            <button
              className="btn btn-checkout"
              onClick={() => {
                window.location.href = '/checkout.html';
              }}
            >
              Gå till kassa
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setIsOpen(false)}
            >
              Fortsätta handla
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
          width: 40px;
          height: 40px;
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
          color: var(--accent);
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
          font-size: 11px;
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
          max-width: 420px;
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
          border-bottom: 1px solid var(--line);
          flex-shrink: 0;
        }

        .cart-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
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
          color: var(--ink);
        }

        .cart-close-btn:hover {
          background: var(--bg-alt);
        }

        .cart-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          color: var(--ink-4);
          text-align: center;
        }

        .cart-empty p {
          margin: 0;
          font-size: 14px;
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
          border: 1px solid #dc2626;
          background: rgba(220, 38, 38, 0.08);
          color: #dc2626;
          border-radius: 4px;
          cursor: pointer;
          transition: all var(--t-fast);
          padding: 0;
        }

        .remove-btn:hover {
          background: #dc2626;
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
          flex-shrink: 0;
        }

        .btn {
          padding: 12px 24px;
          border-radius: var(--r-sm);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all var(--t-fast);
          border: none;
          width: 100%;
        }

        .btn-checkout {
          background: var(--accent);
          color: var(--accent-ink);
        }

        .btn-checkout:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--accent);
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
      `}</style>
    </>
  );
}

if (typeof window !== 'undefined') {
  window.DCMiniCart = MiniCart;
}
