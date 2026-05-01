/* global React, CartManager, DCIcons, DCCheckoutForm */

const { useState, useEffect } = React;

const translations = {
  sv: {
    pageTitle: 'Kassa',
    pageDesc: 'Slutför din beställning',
    emptyCart: 'Din varukorg är tom',
    emptyDesc: 'Gå tillbaka och lägg till produkter i varukorgen',
    continueShopping: 'Fortsätta handla',
    orderSummary: 'Ordersummering',
    subtotal: 'Delsumma',
    shipping: 'Frakt',
    total: 'Totalt',
    processing: 'Bearbetar beställning...',
    orderPlaced: 'Beställning mottagen!',
    orderNumber: 'Ordernummer:',
    error: 'Fel vid beställning',
    tryAgain: 'Försök igen'
  },
  en: {
    pageTitle: 'Checkout',
    pageDesc: 'Complete your order',
    emptyCart: 'Your shopping cart is empty',
    emptyDesc: 'Go back and add products to your cart',
    continueShopping: 'Continue Shopping',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    processing: 'Processing order...',
    orderPlaced: 'Order received!',
    orderNumber: 'Order number:',
    error: 'Error placing order',
    tryAgain: 'Try again'
  }
};

function CheckoutPage() {
  const [lang, setLang] = useState(window.DC_LANG?.current || 'sv');
  const [cart, setCart] = useState(() => {
    return (window.CartManager?.getCart?.()) || { items: [], subtotal: 0 };
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' | 'payment' | 'success'
  const [pendingId, setPendingId] = useState(null);
  const [iframeSnippet, setIframeSnippet] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const iframeRef = React.useRef(null);

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

  const t = translations[lang] || translations.sv;

  const formatPrice = (priceOre) => {
    const priceSek = priceOre / 100;
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(priceSek);
  };

  const queryShipping = async (postalCode, city, address1, deliveryOption = '1') => {
    if (!postalCode || postalCode.length < 5) return;

    setShippingLoading(true);
    try {
      console.log('🚚 Querying shipping options...', { deliveryOption });
      const response = await fetch('/api/shipping/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postal_code: postalCode,
          city: city || '',
          address1: address1 || '',
          items: cart.items,
          delivery_option: deliveryOption
        })
      });

      if (!response.ok) throw new Error('Shipping query failed');

      const data = await response.json();
      console.log('🚚 Shipping options:', data.services?.length || 0);
      setShippingOptions(data.services || []);

      // Auto-select first option
      if (data.services && data.services.length > 0) {
        setSelectedShipping(data.services[0]);
        updateShippingDisplay(data.services[0]);
      }
    } catch (err) {
      console.error('🚚 Error querying shipping:', err);
    } finally {
      setShippingLoading(false);
    }
  };

  const updateShippingDisplay = (shipping) => {
    const costEl = document.getElementById('shipping-cost');
    const totalEl = document.getElementById('total-with-shipping');
    if (costEl && shipping) {
      costEl.textContent = formatPrice(shipping.price * 100);
    }
    if (totalEl && shipping) {
      const total = cart.subtotal + (shipping.price * 100);
      totalEl.textContent = formatPrice(total);
    }
  };

  const handleCheckoutSubmit = async (customerData, deliveryOption, selectedShipping) => {
    console.log('💳 handleCheckoutSubmit - Qliro flow with shipping:', selectedShipping?.name);
    setLoading(true);
    setMessage(null);

    try {
      const currentCart = window.CartManager.getCart();

      if (!currentCart.items || currentCart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      if (!selectedShipping) {
        throw new Error('Shipping method is required');
      }

      console.log('📦 Creating Qliro checkout...');

      // Add shipping cost to cart for the order
      const cartWithShipping = {
        ...currentCart,
        shippingCost: selectedShipping.price,
        shippingService: selectedShipping.id,
        shippingName: selectedShipping.name,
      };

      const response = await fetch('/api/qliro/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerData,
          cartItems: currentCart.items,
          deliveryOption: deliveryOption || 0,
          shipping: selectedShipping
        })
      });

      if (!response.ok) {
        throw new Error(`Qliro error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Qliro checkout created:', result.pendingId);

      setPendingId(result.pendingId);
      setIframeSnippet(result.iframeSnippet);
      setPaymentStep('payment');

      // Start polling for payment status
      startPaymentPoller(result.pendingId);
    } catch (error) {
      console.error('❌ Checkout error:', error);
      setMessage({
        type: 'error',
        text: `${t.error}: ${error.message}`
      });
      setLoading(false);
    }
  };

  const startPaymentPoller = (pendingId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/qliro/status/${pendingId}`);
        if (!response.ok) return;

        const status = await response.json();
        console.log('📊 Payment status:', status.status);

        if (status.status === 'paid') {
          clearInterval(pollInterval);
          console.log('✅ Payment completed!');
          window.CartManager?.clearCart?.();

          setMessage({
            type: 'success',
            text: t.orderPlaced,
            orderId: status.orderId
          });

          setPaymentStep('success');
          setLoading(false);

          if (status.bookingUrl) {
            console.log('🔗 Redirecting to booking in 3s...');
            setTimeout(() => {
              window.location.href = status.bookingUrl;
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 2000);

    // Stop polling after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 600000);
  };

  useEffect(() => {
    document.title = `${t.pageTitle} — Däckcentrum`;
  }, [lang]);

  if (cart.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>{t.emptyCart}</h2>
        <p>{t.emptyDesc}</p>
        <button onClick={() => window.location.href = '/'} style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'var(--color-accent, #10b981)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          {t.continueShopping}
        </button>
      </div>
    );
  }

  // Payment Step - Show Qliro iframe
  if (paymentStep === 'payment' && iframeSnippet) {
    return (
      <>
        {message && (
          <div style={{
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fee2e2'}`,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
            color: message.type === 'success' ? '#166534' : '#991b1b'
          }}>
            {message.type === 'success' ? '✓ ' : '✗ '}
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
          {/* Qliro Iframe */}
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            minHeight: '600px'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600' }}>
              💳 {lang === 'sv' ? 'Betalning' : 'Payment'}
            </h2>
            <div
              ref={iframeRef}
              dangerouslySetInnerHTML={{ __html: iframeSnippet }}
              style={{ width: '100%' }}
            />
            {loading && (
              <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
                {lang === 'sv' ? 'Bearbetar betalning...' : 'Processing payment...'}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            height: 'fit-content',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600' }}>
              {t.orderSummary}
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {cart.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {lang === 'sv' ? 'Antal' : 'Qty'}: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', textAlign: 'right', minWidth: '80px' }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>{t.subtotal}</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>{t.shipping}</span>
                <span>{lang === 'sv' ? 'Gratis' : 'Free'}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--color-accent, #10b981)',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <span>{t.total}</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Success Step
  if (paymentStep === 'success' && message) {
    return (
      <div style={{
        background: 'white',
        padding: '60px 40px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#10b981', marginBottom: '16px' }}>✓ {message.text}</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          {lang === 'sv'
            ? 'Tack för din beställning! Du omdirigeras till bokningssidan...'
            : 'Thank you for your order! Redirecting to booking...'}
        </p>
        {message.orderId && (
          <p style={{ fontSize: '14px', color: '#999' }}>
            {t.orderNumber} <strong>#{message.orderId}</strong>
          </p>
        )}
      </div>
    );
  }

  // Form Step (default)
  return (
    <>
      {message && (
        <div style={{
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fee2e2'}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          color: message.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {message.type === 'success' ? '✓ ' : '✗ '}
          {message.text}
          {message.orderId && <br />}
          {message.orderId && (
            <>
              {t.orderNumber} <strong>#{message.orderId}</strong>
            </>
          )}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <DCCheckoutForm
            onSubmit={(customerData, deliveryOption) => {
              handleCheckoutSubmit(customerData, deliveryOption, selectedShipping);
            }}
            loading={loading}
            onPostalCodeChange={(postalCode, city, address1, deliveryOption) => {
              queryShipping(postalCode, city, address1, deliveryOption);
            }}
          />

          {/* Shipping Options Section */}
          {shippingOptions.length > 0 && (
            <div style={{
              marginTop: '30px',
              paddingTop: '30px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                🚚 {lang === 'sv' ? 'Välj fraktsätt' : 'Choose Shipping'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {shippingOptions.map((option) => (
                  <label key={option.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    border: `2px solid ${selectedShipping?.id === option.id ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: selectedShipping?.id === option.id ? '#f0fdf4' : 'white',
                    transition: 'all 0.2s',
                    userSelect: 'none'
                  }} onClick={(e) => {
                    const input = e.currentTarget.querySelector('input[type="radio"]');
                    if (input) {
                      input.click();
                    }
                  }}>
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={selectedShipping?.id === option.id}
                      onChange={() => {
                        console.log('📦 Selected shipping:', option.id, option.name);
                        setSelectedShipping(option);
                        updateShippingDisplay(option);
                      }}
                      style={{
                        marginRight: '12px',
                        cursor: 'pointer',
                        accentColor: '#10b981',
                        pointerEvents: 'auto'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>
                        {option.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {option.carrier} • {option.delivery_time}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#10b981', minWidth: '60px', textAlign: 'right' }}>
                      {formatPrice(option.price * 100)}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {shippingLoading && (
            <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
              {lang === 'sv' ? '🚚 Hämtar frakstalternativ...' : '🚚 Loading shipping options...'}
            </div>
          )}

          {!shippingLoading && shippingOptions.length === 0 && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '6px',
              color: '#92400e',
              fontSize: '14px'
            }}>
              {lang === 'sv'
                ? '⚠️ Fyll i ett giltigt postnummer för att se frakstalternativ'
                : '⚠️ Enter a valid postal code to see shipping options'}
            </div>
          )}

          {shippingOptions.length > 0 && !selectedShipping && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              color: '#991b1b',
              fontSize: '14px'
            }}>
              {lang === 'sv'
                ? '⚠️ Du måste välja ett fraktsätt'
                : '⚠️ You must select a shipping method'}
            </div>
          )}
        </div>

        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          height: 'fit-content',
          position: 'sticky',
          top: '20px'
        }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600' }}>
            {t.orderSummary}
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            {cart.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {lang === 'sv' ? 'Antal' : 'Qty'}: {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: '600', textAlign: 'right', minWidth: '80px' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>{t.subtotal}</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>{t.shipping}</span>
              <span id="shipping-cost" style={{ fontWeight: '600', color: '#10b981' }}>
                {lang === 'sv' ? 'Välj fraktsätt' : 'Select shipping'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--color-accent, #10b981)',
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <span>{t.total}</span>
              <span id="total-with-shipping">{formatPrice(cart.subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

if (typeof window !== 'undefined') {
  window.CheckoutPage = CheckoutPage;
}
