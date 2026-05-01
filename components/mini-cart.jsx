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
        className="mini-cart-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isEmpty ? 'Varukorg är tom' : `${itemCount} artikel i varukorg`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {itemCount > 0 && <span className="mini-cart-count">{itemCount}</span>}
      </button>

      {isOpen && <div className="mini-cart-overlay" onClick={() => setIsOpen(false)} />}

      <div className={`mini-cart-panel ${isOpen ? 'open' : ''}`}>
        <div className="mini-cart-header">
          <h3>Varukorg</h3>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <IconX size={20} />
          </button>
        </div>

        {isEmpty ? (
          <div className="mini-cart-empty">
            <p>Varukorgen är tom</p>
          </div>
        ) : (
          <>
            <div className="mini-cart-items">
              {cart.items.map((item, idx) => (
                <div key={idx} className="mini-cart-item">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">{formatPrice(item.price)}</div>
                  </div>
                  <div className="item-controls">
                    <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>
                      <IconMinus size={14} />
                    </button>
                    <span className="qty">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>
                      <IconPlus size={14} />
                    </button>
                    <button className="remove-btn" onClick={() => handleRemoveItem(item)}>
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mini-cart-footer">
              <div className="total-row">
                <span>Totalt:</span>
                <span className="total-price">{formatPrice(cart.subtotal)}</span>
              </div>
              <button className="checkout-btn" onClick={() => {
                window.location.href = '/checkout.html';
              }}>
                Gå till kassa
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .mini-cart-btn {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: transparent;
          color: var(--ink);
          cursor: pointer;
          transition: all var(--t-fast);
        }

        .mini-cart-btn:hover {
          background: var(--bg-alt);
          border-color: var(--accent);
          color: var(--accent);
        }

        .mini-cart-count {
          position: absolute;
          top: -8px;
          right: -8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: var(--accent);
          color: var(--accent-ink);
          border-radius: 50%;
          font-size: 11px;
          font-weight: 700;
        }

        .mini-cart-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .mini-cart-panel {
          position: fixed;
          top: 78px;
          right: 20px;
          width: 320px;
          max-height: 500px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
          pointer-events: none;
          transition: all 0.2s ease;
        }

        .mini-cart-panel.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .mini-cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--line);
        }

        .mini-cart-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--ink-4);
          border-radius: 4px;
          transition: all var(--t-fast);
        }

        .close-btn:hover {
          background: var(--bg-alt);
          color: var(--ink);
        }

        .mini-cart-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          text-align: center;
          color: var(--ink-4);
          font-size: 14px;
        }

        .mini-cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mini-cart-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          padding: 8px;
          background: var(--bg-alt);
          border-radius: 6px;
          font-size: 13px;
        }

        .item-info {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-weight: 500;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 4px;
        }

        .item-price {
          color: var(--accent);
          font-weight: 600;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .item-controls button {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--line);
          background: white;
          border-radius: 3px;
          cursor: pointer;
          color: var(--ink-4);
          transition: all var(--t-fast);
        }

        .item-controls button:hover {
          color: var(--accent);
          border-color: var(--accent);
        }

        .qty {
          min-width: 16px;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
        }

        .remove-btn {
          color: #dc2626 !important;
          border-color: #fca5a5 !important;
        }

        .remove-btn:hover {
          background: #fee2e2 !important;
        }

        .mini-cart-footer {
          border-top: 1px solid var(--line);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 14px;
        }

        .total-price {
          color: var(--accent);
        }

        .checkout-btn {
          width: 100%;
          padding: 10px;
          background: var(--accent);
          color: var(--accent-ink);
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: opacity var(--t-fast);
        }

        .checkout-btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .mini-cart-panel {
            right: 10px;
            left: 10px;
            width: auto;
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
  window.DCMiniCart = MiniCart;
}
