/* global React, CartManager, DCIcons, DCCheckoutForm */

const { useState, useEffect } = React;
const { IconTrash } = DCIcons;

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
    // Read directly from localStorage — the guaranteed source of truth,
    // bypassing any CartManager timing issues.
    try {
      const saved = localStorage.getItem('dc_shopping_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return window.CartManager?.getCart?.() || { items: [], subtotal: 0 };
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' | 'payment' | 'success'
  const [pendingId, setPendingId] = useState(null);
  const [iframeSnippet, setIframeSnippet] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [currentDeliveryOption, setCurrentDeliveryOption] = useState('1');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const iframeRef = React.useRef(null);
  const submitRef = React.useRef(null);
  const customerRef = React.useRef(null);

  // Sync cart from CartManager on mount in case useState snapshot was stale
  useEffect(() => {
    if (window.CartManager) {
      const latest = window.CartManager.getCart();
      setCart(latest);
    }
  }, []);

  useEffect(() => {
    if (!window.CartManager?.subscribe) return;

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
    if (deliveryOption === '0') return;

    setShippingLoading(true);
    try {
      console.log('🚚 Querying shipping options...', { postalCode, city, deliveryOption });
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

      console.log('🚚 Response status:', response.status, response.statusText);

      const data = await response.json();
      console.log('🚚 Response data:', data);

      if (!response.ok) {
        throw new Error(`Shipping query failed: ${response.status} ${response.statusText}`);
      }

      console.log('🚚 Shipping options:', data.services?.length || 0);
      setShippingOptions(data.services || []);

      // Auto-select first option
      if (data.services && data.services.length > 0) {
        setSelectedShipping(data.services[0]);
      }
    } catch (err) {
      console.error('🚚 Error querying shipping:', err);
      // Use fallback shipping options on error
      const fallbackOptions = [
        { id: 'postnord', name: 'PostNord Varubrev', price: 49, delivery_time: '2-3 dagar' },
        { id: 'dhl', name: 'DHL Paket', price: 99, delivery_time: '1-2 dagar' },
        { id: 'bring', name: 'Bring Express', price: 129, delivery_time: '1 dag' }
      ];
      setShippingOptions(fallbackOptions);
      if (fallbackOptions.length > 0) {
        setSelectedShipping(fallbackOptions[0]);
      }
    } finally {
      setShippingLoading(false);
    }
  };

  const shippingCostOre = currentDeliveryOption !== '0' && selectedShipping
    ? selectedShipping.price * 100
    : 0;

  const handleCheckoutSubmit = async (customerData, deliveryOption, selectedShipping) => {
    console.log('💳 handleCheckoutSubmit - Qliro flow with shipping:', selectedShipping?.name);
    customerRef.current = customerData;
    setLoading(true);
    setMessage(null);

    try {
      const currentCart = window.CartManager.getCart();

      if (!currentCart.items || currentCart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      if (deliveryOption !== '0' && !selectedShipping) {
        throw new Error('Shipping method is required');
      }

      console.log('📦 Creating Qliro checkout...');

      const isPickup = deliveryOption === '0';

      const response = await fetch('/api/qliro/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerData,
          cartItems: currentCart.items,
          deliveryOption: isPickup ? 0 : 1,
          shipping: isPickup ? null : selectedShipping
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

          // Snapshot everything before clearing cart
          const cartSnapshot = window.CartManager?.getCart?.() || { items: [], subtotal: 0 };
          setConfirmedOrder({
            orderId: status.orderId,
            bookingUrl: status.bookingUrl,
            trackingUrl: status.tracking,
            labelUrl: status.shippingLabel,
            items: cartSnapshot.items,
            subtotal: cartSnapshot.subtotal,
            deliveryOption: currentDeliveryOption,
            shipping: selectedShipping,
            customer: customerRef.current,
            placedAt: new Date().toISOString(),
          });

          window.CartManager?.clearCart?.();
          setMessage({ type: 'success', text: t.orderPlaced, orderId: status.orderId });
          setPaymentStep('success');
          setLoading(false);
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

  // Empty-cart guard — skip when success/payment steps are active (cart is cleared on success)
  if (cart.items.length === 0 && paymentStep === 'form') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>{t.emptyCart}</h2>
        <p>{t.emptyDesc}</p>
        <button onClick={() => window.location.href = '/'} style={{
          display: 'inline-block', padding: '12px 24px',
          background: 'var(--color-accent, #8bc53f)', color: 'white',
          textDecoration: 'none', borderRadius: '6px', fontWeight: '600',
          border: 'none', cursor: 'pointer', fontSize: '16px'
        }}>
          {t.continueShopping}
        </button>
      </div>
    );
  }

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
            top: '120px'
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
                color: 'var(--color-accent, #8bc53f)',
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

  // Success / Thank You Step
  if (paymentStep === 'success' && confirmedOrder) {
    const isPickup = confirmedOrder.deliveryOption === '0';
    const shippingCost = isPickup || !confirmedOrder.shipping ? 0 : confirmedOrder.shipping.price * 100;
    const grandTotal = confirmedOrder.subtotal + shippingCost;
    const c = confirmedOrder.customer || {};
    const placedDate = confirmedOrder.placedAt
      ? new Date(confirmedOrder.placedAt).toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })
      : '';

    const card = (children, mb = '20px') => ({
      background: 'white', borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      padding: '24px 28px', marginBottom: mb
    });
    const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '6px 0' };
    const label = { color: '#6b7280' };
    const val = { fontWeight: '600', color: '#1f2937', textAlign: 'right' };
    const sectionTitle = { margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' };

    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 4px' }}>

        {/* ── Confirmation banner ── */}
        <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #86efac', borderRadius: '14px', padding: '32px 24px', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '52px', lineHeight: 1 }}>✅</div>
          <h1 style={{ margin: '12px 0 6px', fontSize: '26px', fontWeight: '800', color: '#15803d' }}>
            {lang === 'sv' ? 'Tack för din beställning!' : 'Thank you for your order!'}
          </h1>
          <p style={{ margin: '0 0 16px', color: '#166534', fontSize: '14px' }}>
            {lang === 'sv' ? 'Din order är bekräftad och behandlas nu.' : 'Your order is confirmed and is now being processed.'}
          </p>
          <div style={{ display: 'inline-flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {confirmedOrder.orderId && (
              <div style={{ background: 'white', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#15803d', fontWeight: '700', border: '1px solid #86efac' }}>
                {lang === 'sv' ? 'Ordernr' : 'Order #'}: {confirmedOrder.orderId}
              </div>
            )}
            {placedDate && (
              <div style={{ background: 'white', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#15803d', fontWeight: '600', border: '1px solid #86efac' }}>
                {placedDate}
              </div>
            )}
          </div>
        </div>

        {/* ── Customer info ── */}
        {c.name && (
          <div style={card()}>
            <h3 style={sectionTitle}>👤 {lang === 'sv' ? 'Kunduppgifter' : 'Customer Details'}</h3>
            <div style={row}><span style={label}>{lang === 'sv' ? 'Namn' : 'Name'}</span><span style={val}>{c.name}</span></div>
            {c.email && <div style={row}><span style={label}>{lang === 'sv' ? 'E-post' : 'Email'}</span><span style={val}>{c.email}</span></div>}
            {c.phone && <div style={row}><span style={label}>{lang === 'sv' ? 'Telefon' : 'Phone'}</span><span style={val}>{c.phone}</span></div>}
            {c.address1 && <div style={row}><span style={label}>{lang === 'sv' ? 'Adress' : 'Address'}</span><span style={val}>{c.address1}{c.address2 ? ', ' + c.address2 : ''}</span></div>}
            {c.postal_code && <div style={row}><span style={label}>{lang === 'sv' ? 'Ort' : 'City'}</span><span style={val}>{c.postal_code} {c.city}</span></div>}
          </div>
        )}

        {/* ── Products ── */}
        <div style={card()}>
          <h3 style={sectionTitle}>🛒 {lang === 'sv' ? 'Beställda produkter' : 'Ordered Products'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            {confirmedOrder.items.map((item, idx) => {
              const imgSrc = typeof item.image === 'string' ? item.image : (item.image?.webshop_thumb || item.image?.thumbnail || item.image?.original);
              return (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                  {imgSrc
                    ? <img src={imgSrc} alt={item.name} onError={e => { e.target.style.display='none'; }} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb', flexShrink: 0 }} />
                    : <div style={{ width: '56px', height: '56px', borderRadius: '6px', background: '#e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🔴</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>{lang === 'sv' ? 'Antal' : 'Qty'}: {item.quantity}</div>
                    {item.attrs?.dimension && !String(item.attrs.dimension).includes('undefined') && (
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{item.attrs.dimension}</div>
                    )}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1f2937', flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={row}><span style={label}>{lang === 'sv' ? 'Delsumma' : 'Subtotal'}</span><span style={val}>{formatPrice(confirmedOrder.subtotal)}</span></div>
            <div style={row}>
              <span style={label}>{lang === 'sv' ? 'Frakt' : 'Shipping'}</span>
              <span style={val}>{isPickup ? (lang === 'sv' ? 'Gratis' : 'Free') : shippingCost > 0 ? formatPrice(shippingCost) : '–'}</span>
            </div>
            <div style={{ ...row, borderTop: '1px solid #e5e7eb', paddingTop: '10px', marginTop: '4px' }}>
              <span style={{ fontWeight: '700', fontSize: '16px' }}>{lang === 'sv' ? 'Totalt betalt' : 'Total paid'}</span>
              <span style={{ fontWeight: '800', fontSize: '18px', color: '#8bc53f' }}>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* ── Delivery ── */}
        <div style={card()}>
          <h3 style={sectionTitle}>{isPickup ? '🏪' : '🚚'} {lang === 'sv' ? 'Leverans' : 'Delivery'}</h3>
          {isPickup ? (
            <>
              <div style={row}><span style={label}>{lang === 'sv' ? 'Metod' : 'Method'}</span><span style={val}>{lang === 'sv' ? 'Upphämtning på verkstad' : 'Workshop Pickup'}</span></div>
              <div style={row}><span style={label}>{lang === 'sv' ? 'Adress' : 'Address'}</span><span style={val}>Musköstgatan 2, 252 20 Helsingborg</span></div>
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', fontSize: '13px', color: '#166534' }}>
                {lang === 'sv' ? '📞 Vi ringer dig när ordern är klar för upphämtning.' : '📞 We will call you when the order is ready for pickup.'}
              </div>
            </>
          ) : (
            <>
              <div style={row}><span style={label}>{lang === 'sv' ? 'Fraktsätt' : 'Carrier'}</span><span style={val}>{confirmedOrder.shipping?.name || '–'}</span></div>
              {confirmedOrder.shipping?.delivery_time && <div style={row}><span style={label}>{lang === 'sv' ? 'Leveranstid' : 'Est. delivery'}</span><span style={val}>{confirmedOrder.shipping.delivery_time}</span></div>}
              {c.address1 && <div style={row}><span style={label}>{lang === 'sv' ? 'Leveransadress' : 'Ship to'}</span><span style={val}>{c.address1}, {c.postal_code} {c.city}</span></div>}
              <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {confirmedOrder.trackingUrl
                  ? <a href={confirmedOrder.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '9px 18px', background: '#8bc53f', color: 'white', borderRadius: '7px', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}>📦 {lang === 'sv' ? 'Spåra paket' : 'Track package'}</a>
                  : <div style={{ padding: '9px 14px', background: '#f3f4f6', borderRadius: '7px', fontSize: '13px', color: '#6b7280' }}>{lang === 'sv' ? '⏳ Spårningslänk skickas via e-post' : '⏳ Tracking link will be sent by email'}</div>
                }
                {confirmedOrder.labelUrl && (
                  <a href={confirmedOrder.labelUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '9px 18px', border: '1px solid #8bc53f', color: '#8bc53f', borderRadius: '7px', fontWeight: '600', fontSize: '13px', textDecoration: 'none', background: 'white' }}>🖨 {lang === 'sv' ? 'Fraktetikett' : 'Shipping label'}</a>
                )}
              </div>
            </>
          )}

          {confirmedOrder.bookingUrl && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
              <a href={confirmedOrder.bookingUrl} style={{ display: 'inline-block', padding: '10px 22px', background: '#8bc53f', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
                📅 {lang === 'sv' ? 'Boka tid för montering' : 'Book installation appointment'}
              </a>
            </div>
          )}
        </div>

        {/* ── Next steps ── */}
        <div style={card()}>
          <h3 style={sectionTitle}>📋 {lang === 'sv' ? 'Nästa steg' : 'What happens next'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              lang === 'sv' ? '📧 Orderbekräftelse skickas till ' + (c.email || 'din e-post') : '📧 Order confirmation sent to ' + (c.email || 'your email'),
              isPickup
                ? (lang === 'sv' ? '📞 Vi kontaktar dig när ordern är redo' : '📞 We will contact you when ready for pickup')
                : (lang === 'sv' ? '📦 Din order packas och skickas inom 1–2 arbetsdagar' : '📦 Your order will be packed and shipped within 1–2 business days'),
              lang === 'sv' ? '🔧 Boka tid för montering om du behöver hjälp' : '🔧 Book a fitting appointment if you need assistance'
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#374151' }}>
                <span style={{ fontWeight: '700', color: '#8bc53f', minWidth: '20px' }}>{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
          <button onClick={() => window.location.href = '/'}
            style={{ padding: '12px 28px', background: '#8bc53f', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
            {lang === 'sv' ? '🛒 Fortsätta handla' : '🛒 Continue Shopping'}
          </button>
          {confirmedOrder.bookingUrl && (
            <a href={confirmedOrder.bookingUrl}
              style={{ padding: '12px 28px', border: '2px solid #8bc53f', color: '#8bc53f', borderRadius: '8px', fontWeight: '700', fontSize: '15px', textDecoration: 'none', background: 'white' }}>
              📅 {lang === 'sv' ? 'Boka montering' : 'Book fitting'}
            </a>
          )}
        </div>
      </div>
    );
  }

  // Form Step (default)
  return (
    <>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>
          {t.pageTitle}
        </h1>
        <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>{t.pageDesc}</p>
      </div>

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

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .checkout-form-col { padding: 20px !important; }
          .checkout-summary-col { position: static !important; top: auto !important; padding: 20px !important; }
          .checkout-container { padding: 16px 12px !important; }
        }
        @media (max-width: 480px) {
          .checkout-form-col { padding: 14px !important; border-radius: 8px !important; }
          .checkout-summary-col { padding: 14px !important; border-radius: 8px !important; }
        }
      `}</style>

      <div className="checkout-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        <div className="checkout-form-col" style={{
          background: 'white',
          padding: '32px',
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
            onDeliveryOptionChange={(opt) => {
              setCurrentDeliveryOption(opt);
              if (opt === '0') {
                setShippingOptions([]);
                setSelectedShipping(null);
              }
            }}
            submitRef={submitRef}
            hideActions={true}
          />

          {/* Shipping Options Section — hidden for in-store pickup */}
          {currentDeliveryOption !== '0' && shippingOptions.length > 0 && (
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
                    border: `2px solid ${selectedShipping?.id === option.id ? '#8bc53f' : '#e5e7eb'}`,
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
                        setSelectedShipping(option);
                      }}
                      style={{
                        marginRight: '12px',
                        cursor: 'pointer',
                        accentColor: '#8bc53f',
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
                    <div style={{ fontWeight: '600', color: '#8bc53f', minWidth: '60px', textAlign: 'right' }}>
                      {formatPrice(option.price * 100)}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentDeliveryOption !== '0' && shippingLoading && (
            <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
              {lang === 'sv' ? '🚚 Hämtar frakstalternativ...' : '🚚 Loading shipping options...'}
            </div>
          )}

          {currentDeliveryOption !== '0' && !shippingLoading && shippingOptions.length === 0 && (
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

          {currentDeliveryOption !== '0' && shippingOptions.length > 0 && !selectedShipping && (
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

        <div className="checkout-summary-col" style={{
          background: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: '100px'
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
            {cart.items.map((item, idx) => {
              const imgSrc = typeof item.image === 'string' ? item.image : (item.image?.webshop_thumb || item.image?.thumbnail || item.image?.original);
              return (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={item.name}
                      onError={(e) => { e.target.style.display = 'none'; }}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb', flexShrink: 0, background: '#f9fafb' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => item.quantity > 1 && window.CartManager?.updateQuantity?.(item.id, item.supplier_id, item.location_id, item.quantity - 1)}
                        style={{ width: '24px', height: '24px', border: '1px solid #e5e7eb', borderRadius: '4px', background: 'white', cursor: item.quantity > 1 ? 'pointer' : 'not-allowed', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', opacity: item.quantity > 1 ? 1 : 0.4 }}
                      >−</button>
                      <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => window.CartManager?.updateQuantity?.(item.id, item.supplier_id, item.location_id, item.quantity + 1)}
                        disabled={item.stock > 0 && item.quantity >= item.stock}
                        style={{ width: '24px', height: '24px', border: '1px solid #e5e7eb', borderRadius: '4px', background: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', opacity: (item.stock > 0 && item.quantity >= item.stock) ? 0.35 : 1, cursor: (item.stock > 0 && item.quantity >= item.stock) ? 'not-allowed' : 'pointer' }}
                      >+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', textAlign: 'right', minWidth: '72px' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <button
                      type="button"
                      onClick={() => window.CartManager?.removeItem?.(item.id, item.supplier_id, item.location_id)}
                      title={lang === 'sv' ? 'Ta bort' : 'Remove'}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', border: '1px solid #fca5a5', background: 'rgba(220,38,38,0.06)', color: '#dc2626', borderRadius: '5px', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>{t.subtotal}</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>{t.shipping}</span>
              <span style={{ fontWeight: '600', color: '#8bc53f' }}>
                {currentDeliveryOption === '0'
                  ? (lang === 'sv' ? 'Gratis' : 'Free')
                  : selectedShipping
                    ? formatPrice(shippingCostOre)
                    : (lang === 'sv' ? 'Välj fraktsätt' : 'Select shipping')}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--color-accent, #8bc53f)',
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <span>{t.total}</span>
              <span>{formatPrice(cart.subtotal + shippingCostOre)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => submitRef.current?.({ preventDefault: () => {} })}
              style={{
                padding: '14px 24px',
                background: loading ? '#6ee7b7' : '#8bc53f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              {loading ? (lang === 'sv' ? 'Bearbetar...' : 'Processing...') : (lang === 'sv' ? 'Slutför beställning' : 'Complete Order')}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#8bc53f',
                border: '1px solid #8bc53f',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {lang === 'sv' ? 'Avbryt' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

if (typeof window !== 'undefined') {
  window.CheckoutPage = CheckoutPage;
}
