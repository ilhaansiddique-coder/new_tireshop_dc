/* global React, CartManager, DCIcons */

const { useState, useEffect } = React;
const { IconCheck, IconAlertCircle } = DCIcons;

function CheckoutForm({ onSubmit, loading = false }) {
  const [lang, setLang] = useState(window.DC_LANG?.current || 'sv');
  const [customerType, setCustomerType] = useState('person');
  const [useProfile, setUseProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(CartManager.getCustomer());

  const [formData, setFormData] = useState({
    name: savedProfile?.name || '',
    email: savedProfile?.email || '',
    phone: savedProfile?.phone || '',
    address1: savedProfile?.address1 || '',
    address2: savedProfile?.address2 || '',
    postal_code: savedProfile?.postal_code || '',
    city: savedProfile?.city || '',
    id_number: savedProfile?.id_number || '',
    car_licenseplate: '',
    car_mileage: '',
    save_profile: false
  });

  const [errors, setErrors] = useState({});

  const translations = {
    sv: {
      customerInfo: 'Kunduppgifter',
      customerType: 'Kundtyp',
      person: 'Privatperson',
      business: 'Företag',
      fullName: 'Fullständigt namn',
      email: 'E-post',
      phone: 'Telefonnummer',
      personalNumber: 'Personnummer (YYYYMMDDNNNN)',
      companyNumber: 'Organisationsnummer',
      address: 'Adress',
      street: 'Gata och husnummer',
      apartment: 'Lägenhet/apt (valfritt)',
      postalCode: 'Postnummer',
      city: 'Stad',
      vehicleInfo: 'Fordonsinformation (valfritt)',
      licensePlate: 'Registreringsnummer',
      mileage: 'Körsträcka (mil)',
      deliveryOptions: 'Leveransalternativ',
      pickup: 'Hämta på verkstad',
      saveProfile: 'Spara som profil för framtida beställningar',
      completeOrder: 'Slutför beställning',
      cancel: 'Avbryt',
      required: 'Obligatoriskt',
      invalidEmail: 'Ogiltig e-postadress',
      invalidPhone: 'Ogiltigt telefonnummer',
      useProfile: 'Använd sparad profil',
      editProfile: 'Redigera'
    },
    en: {
      customerInfo: 'Customer Information',
      customerType: 'Customer Type',
      person: 'Individual',
      business: 'Business',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      personalNumber: 'Personal Number (YYYYMMDDNNNN)',
      companyNumber: 'Company Registration Number',
      address: 'Address',
      street: 'Street and house number',
      apartment: 'Apartment/apt (optional)',
      postalCode: 'Postal Code',
      city: 'City',
      vehicleInfo: 'Vehicle Information (optional)',
      licensePlate: 'License Plate',
      mileage: 'Mileage (miles)',
      deliveryOptions: 'Delivery Options',
      pickup: 'Pick up at workshop',
      saveProfile: 'Save as profile for future orders',
      completeOrder: 'Complete Order',
      cancel: 'Cancel',
      required: 'Required',
      invalidEmail: 'Invalid email address',
      invalidPhone: 'Invalid phone number',
      useProfile: 'Use saved profile',
      editProfile: 'Edit'
    }
  };

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

  const t = translations[lang] || translations.sv;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = t.required;
    if (!formData.phone?.trim()) newErrors.phone = t.required;
    if (!formData.address1?.trim()) newErrors.address1 = t.required;
    if (!formData.postal_code?.trim()) newErrors.postal_code = t.required;
    if (!formData.city?.trim()) newErrors.city = t.required;

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }

    if (formData.phone && !/^[\d\s\-+()]*$/.test(formData.phone)) {
      newErrors.phone = t.invalidPhone;
    }

    if (customerType === 'business' && !formData.id_number?.trim()) {
      newErrors.id_number = t.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLoadProfile = () => {
    if (savedProfile) {
      setFormData(prev => ({
        ...prev,
        name: savedProfile.name,
        email: savedProfile.email,
        phone: savedProfile.phone,
        address1: savedProfile.address1,
        address2: savedProfile.address2,
        postal_code: savedProfile.postal_code,
        city: savedProfile.city,
        id_number: savedProfile.id_number
      }));
      setUseProfile(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const customerData = {
      type: customerType === 'business' ? 1 : 2,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      address1: formData.address1,
      address2: formData.address2 || undefined,
      postal_code: formData.postal_code,
      city: formData.city,
      id_number: formData.id_number || undefined,
      update: true
    };

    if (formData.car_licenseplate) {
      customerData.car = {
        licenseplate: formData.car_licenseplate,
        ...(formData.car_mileage && { mileage: parseInt(formData.car_mileage) })
      };
    }

    if (formData.save_profile) {
      CartManager.saveCustomer(customerData);
    }

    onSubmit(customerData, 0); // 0 = pickup option
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      {/* Show profile selector if profile exists */}
      {savedProfile && !useProfile && (
        <div className="form-section profile-selector">
          <div className="profile-info">
            <h3>{savedProfile.name}</h3>
            <p>{savedProfile.phone}</p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setUseProfile(true)}
          >
            {t.editProfile}
          </button>
        </div>
      )}

      {/* Customer Information Section */}
      <fieldset className="form-section">
        <legend>{t.customerInfo}</legend>

        {/* Customer Type */}
        <div className="form-group">
          <label>{t.customerType}</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="customerType"
                value="person"
                checked={customerType === 'person'}
                onChange={(e) => setCustomerType(e.target.value)}
              />
              {t.person}
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="customerType"
                value="business"
                checked={customerType === 'business'}
                onChange={(e) => setCustomerType(e.target.value)}
              />
              {t.business}
            </label>
          </div>
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="name">
            {t.fullName}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? 'error' : ''}
            placeholder="John Doe"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">
            {t.email}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            placeholder="john@example.com"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone">
            {t.phone}
            <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone ? 'error' : ''}
            placeholder="+46 70 123 45 67"
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        {/* ID Number */}
        {customerType === 'business' && (
          <div className="form-group">
            <label htmlFor="id_number">
              {t.companyNumber}
              <span className="required">*</span>
            </label>
            <input
              type="text"
              id="id_number"
              name="id_number"
              value={formData.id_number}
              onChange={handleInputChange}
              className={errors.id_number ? 'error' : ''}
              placeholder="123456-7890"
            />
            {errors.id_number && <span className="error-text">{errors.id_number}</span>}
          </div>
        )}
      </fieldset>

      {/* Address Section */}
      <fieldset className="form-section">
        <legend>{t.address}</legend>

        {/* Street */}
        <div className="form-group">
          <label htmlFor="address1">
            {t.street}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="address1"
            name="address1"
            value={formData.address1}
            onChange={handleInputChange}
            className={errors.address1 ? 'error' : ''}
            placeholder="Storgatan 1"
          />
          {errors.address1 && <span className="error-text">{errors.address1}</span>}
        </div>

        {/* Apartment */}
        <div className="form-group">
          <label htmlFor="address2">
            {t.apartment}
          </label>
          <input
            type="text"
            id="address2"
            name="address2"
            value={formData.address2}
            onChange={handleInputChange}
            placeholder="Lägenhet 42"
          />
        </div>

        {/* Postal Code */}
        <div className="form-group">
          <label htmlFor="postal_code">
            {t.postalCode}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleInputChange}
            className={errors.postal_code ? 'error' : ''}
            placeholder="252 20"
          />
          {errors.postal_code && <span className="error-text">{errors.postal_code}</span>}
        </div>

        {/* City */}
        <div className="form-group">
          <label htmlFor="city">
            {t.city}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={errors.city ? 'error' : ''}
            placeholder="Helsingborg"
          />
          {errors.city && <span className="error-text">{errors.city}</span>}
        </div>
      </fieldset>

      {/* Vehicle Information Section */}
      <fieldset className="form-section">
        <legend>{t.vehicleInfo}</legend>

        <div className="form-group">
          <label htmlFor="car_licenseplate">
            {t.licensePlate}
          </label>
          <input
            type="text"
            id="car_licenseplate"
            name="car_licenseplate"
            value={formData.car_licenseplate}
            onChange={handleInputChange}
            placeholder="ABC123"
          />
        </div>

        <div className="form-group">
          <label htmlFor="car_mileage">
            {t.mileage}
          </label>
          <input
            type="number"
            id="car_mileage"
            name="car_mileage"
            value={formData.car_mileage}
            onChange={handleInputChange}
            placeholder="150000"
            min="0"
          />
        </div>
      </fieldset>

      {/* Delivery Options */}
      <fieldset className="form-section">
        <legend>{t.deliveryOptions}</legend>
        <label className="radio-label">
          <input
            type="radio"
            name="delivery"
            value="0"
            defaultChecked
          />
          {t.pickup}
        </label>
      </fieldset>

      {/* Save Profile */}
      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="save_profile"
            checked={formData.save_profile}
            onChange={handleInputChange}
          />
          {t.saveProfile}
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '...' : t.completeOrder}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.history.back()}
        >
          {t.cancel}
        </button>
      </div>

      <style>{`
        .checkout-form {
          max-width: 600px;
          margin: 0 auto;
        }

        .form-section {
          margin-bottom: 32px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .form-section legend {
          margin-bottom: 20px;
          padding: 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text, #1f2937);
        }

        .profile-selector {
          background: #f0fdf4;
          border-color: #bbf7d0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .profile-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .profile-info p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .form-group {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text, #1f2937);
        }

        .required {
          color: #dc2626;
          margin-left: 4px;
        }

        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="number"] {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: var(--color-accent, #10b981);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        input.error {
          border-color: #dc2626;
        }

        .error-text {
          margin-top: 4px;
          font-size: 12px;
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .radio-group,
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .radio-label,
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        input[type="radio"],
        input[type="checkbox"] {
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          flex: 1;
        }

        .btn-primary {
          background: var(--color-accent, #10b981);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: transparent;
          color: var(--color-accent, #10b981);
          border: 1px solid var(--color-accent, #10b981);
        }

        .btn-secondary:hover {
          background: var(--color-accent, #10b981);
          color: white;
        }
      `}</style>
    </form>
  );
}

if (typeof window !== 'undefined') {
  window.DCCheckoutForm = CheckoutForm;
}
