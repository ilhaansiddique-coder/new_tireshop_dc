/* global React */

const { useState, useEffect } = React;

const translations = {
  sv: {
    title: 'Orderkonfirmation',
    subtitle: 'Din beställning har mottagits!',
    confirmTitle: 'Tack för din beställning',
    confirmDesc: 'Vi har mottagit din order och kommer att påbörja behandlingen snart.',
    orderNumber: 'Ordernummer',
    orderDate: 'Orderdatum',
    totalAmount: 'Totalt belopp',
    status: 'Status',
    status_pending: 'Väntande',
    nextSteps: 'Nästa steg',
    step1: 'Orderbekräftelse skickas via e-post',
    step2: 'Dina produkter förbereds för hämtning',
    step3: 'Vi kontaktar dig när allt är klart',
    backHome: 'Tillbaka till startsidan',
    continueShopping: 'Fortsätt handla',
    error: 'Ordernummer kunde inte hittas',
    errorDesc: 'Det verkar som att något gick fel. Kontakta oss för att få hjälp.',
    loading: 'Hämtar orderdetaljer...'
  },
  en: {
    title: 'Order Confirmation',
    subtitle: 'Your order has been received!',
    confirmTitle: 'Thank you for your order',
    confirmDesc: 'We have received your order and will begin processing it shortly.',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    totalAmount: 'Total Amount',
    status: 'Status',
    status_pending: 'Pending',
    nextSteps: 'What\'s Next',
    step1: 'Order confirmation will be sent to your email',
    step2: 'Your products will be prepared for pickup',
    step3: 'We\'ll contact you when everything is ready',
    backHome: 'Back to Home',
    continueShopping: 'Continue Shopping',
    error: 'Order number not found',
    errorDesc: 'Something went wrong. Please contact us for assistance.',
    loading: 'Loading order details...'
  }
};

function OrderConfirmationPage() {
  const [lang, setLang] = useState(window.DC_LANG?.current || 'sv');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');

    if (!orderId) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/orders?id=${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.response?.err) {
          setError(true);
        } else {
          setOrder(data.data || data);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
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

  useEffect(() => {
    document.title = `${t.title} — Däckcentrum`;
  }, [lang]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTopColor: 'var(--color-accent, #10b981)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fee2e2',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        color: '#991b1b'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '600' }}>
          {t.error}
        </h2>
        <p style={{ margin: '0 0 24px 0' }}>{t.errorDesc}</p>
        <a href="/" style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'var(--color-accent, #10b981)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '600'
        }}>
          {t.backHome}
        </a>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#f0fdf4',
          border: '3px solid var(--color-accent, #10b981)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: 'var(--color-accent, #10b981)',
          fontSize: '48px',
          fontWeight: 'bold'
        }}>
          ✓
        </div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>
          {t.confirmTitle}
        </h1>
        <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>
          {t.confirmDesc}
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        marginBottom: '40px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'left'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <span style={{ color: '#6b7280', fontWeight: '500' }}>{t.orderNumber}</span>
          <span style={{ fontWeight: '600' }}>#{order.id}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <span style={{ color: '#6b7280', fontWeight: '500' }}>{t.orderDate}</span>
          <span style={{ fontWeight: '600' }}>
            {new Date(order.created_at || Date.now()).toLocaleDateString('sv-SE')}
          </span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <span style={{ color: '#6b7280', fontWeight: '500' }}>{t.totalAmount}</span>
          <span style={{ fontWeight: '600' }}>
            {order.total ? formatPrice(order.total) : '-'}
          </span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 0'
        }}>
          <span style={{ color: '#6b7280', fontWeight: '500' }}>{t.status}</span>
          <span style={{ fontWeight: '600' }}>{t.status_pending}</span>
        </div>
      </div>

      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '40px',
        textAlign: 'left',
        color: '#166534'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
          {t.nextSteps}
        </h3>
        <ol style={{ margin: 0, paddingLeft: '24px' }}>
          <li style={{ marginBottom: '12px' }}>{t.step1}</li>
          <li style={{ marginBottom: '12px' }}>{t.step2}</li>
          <li>{t.step3}</li>
        </ol>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center'
      }}>
        <a href="/" style={{
          padding: '12px 32px',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer',
          textDecoration: 'none',
          border: 'none',
          display: 'inline-block',
          background: 'var(--color-accent, #10b981)',
          color: 'white',
          transition: 'opacity 0.2s'
        }}>
          {t.backHome}
        </a>
        <a href="/" style={{
          padding: '12px 32px',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer',
          textDecoration: 'none',
          border: '1px solid var(--color-accent, #10b981)',
          display: 'inline-block',
          background: 'transparent',
          color: 'var(--color-accent, #10b981)',
          transition: 'all 0.2s'
        }}>
          {t.continueShopping}
        </a>
      </div>
    </>
  );
}

if (typeof window !== 'undefined') {
  window.OrderConfirmationPage = OrderConfirmationPage;
}
