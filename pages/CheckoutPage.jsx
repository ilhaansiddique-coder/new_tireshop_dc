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
  const [cart, setCart] = useState(CartManager.getCart());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = CartManager.subscribe((updatedCart) => {
      setCart(updatedCart);
    });

    const handleLanguageChange = () => {
      setLang(window.DC_LANG?.current || 'sv');
    };

    document.addEventListener('languagechange', handleLanguageChange);
    window.addEventListener('dc-language-changed', handleLanguageChange);

    return () => {
      unsubscribe();
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

  const handleCheckoutSubmit = async (customerData, deliveryOption) => {
    setLoading(true);
    setMessage(null);

    try {
      const orderData = CartManager.prepareOrder(customerData, deliveryOption);

      const response = await fetch(
        '/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.response?.err) {
        throw new Error(result.response.err);
      }

      const orderId = result.data?.id;
      CartManager.clearCart();

      setMessage({
        type: 'success',
        text: t.orderPlaced,
        orderId: orderId
      });

      setTimeout(() => {
        window.location.href = `/order-confirmation.html?order=${orderId}`;
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: `${t.error}: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = `${t.pageTitle} — Däckcentrum`;
  }, [lang]);

  if (cart.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>{t.emptyCart}</h2>
        <p>{t.emptyDesc}</p>
        <a href="/" style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'var(--color-accent, #10b981)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '600'
        }}>
          {t.continueShopping}
        </a>
      </div>
    );
  }

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
            onSubmit={handleCheckoutSubmit}
            loading={loading}
          />
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

if (typeof window !== 'undefined') {
  window.CheckoutPage = CheckoutPage;
}
