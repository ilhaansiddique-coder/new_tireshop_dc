/* global React */

const { useState } = React;

const BookingModal = ({ isOpen, onClose, serviceTitle }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    plate: '',
    date: '',
    message: ''
  });

  const [status, setStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: serviceTitle
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Booking failed');
      }

      const data = await response.json();
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', plate: '', date: '', message: '' });

      // Auto-close after 3 seconds
      setTimeout(() => {
        setStatus(null);
        onClose();
      }, 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ styles.overlay }} onClick={onClose}>
      <div style={{ styles.modal }} onClick={(e) => e.stopPropagation()}>
        <div style={{ styles.header }}>
          <h2 style={{ styles.title }}>Boka {serviceTitle}</h2>
          <button
            onClick={onClose}
            style={{ styles.closeBtn }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div style={{ styles.success }}>
            <div style={{ styles.successIcon }}>✓</div>
            <p style={{ styles.successText }}>
              Tack! Vi bekräftar din bokning inom kort.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ styles.form }}>
            <div style={{ styles.formGroup }}>
              <label style={{ styles.label }}>Namn *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ditt namn"
                required
                style={{ styles.input }}
              />
            </div>

            <div style={{ styles.formGroup }}>
              <label style={{ styles.label }}>Telefon *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="070-123 45 67"
                required
                style={{ styles.input }}
              />
            </div>

            <div style={{ styles.formGroup }}>
              <label style={{ styles.label }}>E-post *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="din@email.se"
                required
                style={{ styles.input }}
              />
            </div>

            <div style={{ styles.formGroup }}>
              <label style={{ styles.label }}>Registreringsnummer (valfritt)</label>
              <input
                type="text"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                placeholder="ABC123"
                style={{ styles.input }}
              />
            </div>

            <div style={{ styles.formGroup }}>
              <label style={{ styles.label }}>Önskad datum *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                style={{ styles.input }}
              />
            </div>

            <div style={{ styles.formGroup }}>
              <label style={{ styles.label }}>Meddelande (valfritt)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Berätta mer om ditt behov..."
                rows="4"
                style={{ styles.textarea }}
              />
            </div>

            {status === 'error' && (
              <div style={{ styles.error }}>
                <strong>Fel:</strong> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                ...styles.submitBtn,
                ...(status === 'loading' ? styles.submitBtnLoading : {})
              }}
            >
              {status === 'loading' ? 'Bokar...' : 'Boka tid'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '24px 24px 0 0',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'slideUp 300ms ease-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#111827'
  },
  input: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit'
  },
  textarea: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  submitBtn: {
    padding: '12px 24px',
    backgroundColor: '#8BC53F',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '12px'
  },
  submitBtnLoading: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  success: {
    textAlign: 'center',
    padding: '40px 0'
  },
  successIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: '#d1fae5',
    color: '#059669',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 16px',
    fontWeight: 'bold'
  },
  successText: {
    fontSize: '16px',
    color: '#374151',
    margin: 0
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px'
  }
};

window.DCBookingModal = BookingModal;
