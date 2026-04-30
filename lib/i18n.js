/**
 * Internationalization (i18n) System
 * Supports Swedish (sv) and English (en)
 */

const TRANSLATIONS = {
  sv: {
    // Common
    search: 'Sök',
    close: 'Stäng',
    back: 'Tillbaka',
    next: 'Nästa',
    prev: 'Föregående',
    loading: 'Laddar...',
    error: 'Ett fel uppstod',
    retry: 'Försök igen',
    noResults: 'Inga resultat hittades',

    // Navigation
    home: 'Hem',
    about: 'Om oss',
    services: 'Tjänster',
    tyreHotel: 'Däckhotell',
    contact: 'Kontakt',
    language: 'Språk',

    // Services
    tireFitting: 'Däckskifte',
    balancing: 'Balansering',
    wheelAlignment: 'Hjulinställning',
    rimService: 'Fälgservice',
    punctureRepair: 'Punktering',
    repair: 'Lagning',
    rimService: 'Fälgservice',

    // RegSearch
    findTiresForCar: 'Hitta däck till din bil',
    enterPlateNumber: 'Ange regnummer',
    licensePlate: 'Registreringsnummer',
    plateHelp: 'Vi visar produkter som passar din bil — gratis och utan inloggning',
    plateNotSaved: 'Vi sparar inget — sökningen sker bara här.',
    searchByPlate: 'Sök på regnummer',
    yourPlateNumber: 'Ditt regnummer',

    // Products
    tires: 'Däck',
    rims: 'Fälgar',
    completeWheels: 'Kompletta hjul',
    summerTires: 'Sommardäck',
    winterTires: 'Vinterdäck',
    allSeasonTires: 'Helårsdäck',
    usedTires: 'Begagnade däck',
    steelRims: 'Stålfälg',
    aluminumRims: 'Aluminiumfälg',
    brand: 'Märke',
    model: 'Modell',
    size: 'Storlek',
    price: 'Pris',
    from: 'Från',
    inStock: 'I lager',
    outOfStock: 'Slut i lager',
    add: 'Lägg till',
    addToCart: 'Lägg till i varukorg',
    remove: 'Ta bort',

    // Vehicle info
    vehicle: 'Fordon',
    vehicleType: 'Fordonstyp',
    brand: 'Märke',
    model: 'Modell',
    year: 'År',
    licenseplate: 'Registreringsnummer',

    // Tyre hotel
    tireHotelStorage: 'Däckhotell',
    storeTires: 'Lagra dina däck',
    tireStorage: 'Vi förvarar dina däck över säsongen — tvättat, märkt och redo.',
    storageFeatures: [
      'Tvätt & kontroll vid inlämning',
      'Klimatlager — slipp sprickor',
      'Påminnelse innan säsongsskifte',
      '4 hjul från 695 kr / säsong'
    ],
    learnMore: 'Läs mer',
    bookStorage: 'Boka inlämning',

    // Buttons & CTA
    bookService: 'Boka tid',
    readMore: 'Läs mer',
    viewMore: 'Visa mer',
    quickInfo: 'Snabba fakta',
    serviceTime: 'Tid',
    priceFrom: 'Pris från',

    // Contact
    contact: 'Kontakt',
    address: 'Musköstgatan 2, Helsingborg',
    phone: '042-16 08 39',
    email: 'info@dackcentrum.se',
    hours: 'Öppettider',
    monday: 'Måndag',
    tuesday: 'Tisdag',
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Lördag',
    sunday: 'Söndag',
    open: 'Öppet',
    closed: 'Stängt',

    // Footer
    followUs: 'Följ oss',
    quickLinks: 'Snabblänkar',
    privacy: 'Integritet',
    terms: 'Villkor',
    copyright: '© 2024 Däckcentrum. Alla rättigheter förbehållna.',

    // Messages
    successOrderCreated: 'Beställning skapad framgångsrikt!',
    errorOrderFailed: 'Det gick inte att skapa beställningen. Försök igen.',
    successAdded: 'Tillagd i varukorg',
    errorLoading: 'Det gick inte att ladda data. Försök igen.',
  },

  en: {
    // Common
    search: 'Search',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    prev: 'Previous',
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Try again',
    noResults: 'No results found',

    // Navigation
    home: 'Home',
    about: 'About',
    services: 'Services',
    tyreHotel: 'Tyre Hotel',
    contact: 'Contact',
    language: 'Language',

    // Services
    tireFitting: 'Tyre Fitting',
    balancing: 'Balancing',
    wheelAlignment: 'Wheel Alignment',
    rimService: 'Rim Service',
    punctureRepair: 'Puncture Repair',
    repair: 'Repair',
    rimService: 'Rim Service',

    // RegSearch
    findTiresForCar: 'Find tyres for your car',
    enterPlateNumber: 'Enter registration number',
    licensePlate: 'Registration number',
    plateHelp: 'We show products that fit your car — free and without registration',
    plateNotSaved: 'We do not save anything — the search only happens here.',
    searchByPlate: 'Search by registration',
    yourPlateNumber: 'Your registration number',

    // Products
    tires: 'Tyres',
    rims: 'Rims',
    completeWheels: 'Complete Wheels',
    summerTires: 'Summer Tyres',
    winterTires: 'Winter Tyres',
    allSeasonTires: 'All-Season Tyres',
    usedTires: 'Used Tyres',
    steelRims: 'Steel Rims',
    aluminumRims: 'Aluminum Rims',
    brand: 'Brand',
    model: 'Model',
    size: 'Size',
    price: 'Price',
    from: 'From',
    inStock: 'In stock',
    outOfStock: 'Out of stock',
    add: 'Add',
    addToCart: 'Add to cart',
    remove: 'Remove',

    // Vehicle info
    vehicle: 'Vehicle',
    vehicleType: 'Vehicle type',
    brand: 'Brand',
    model: 'Model',
    year: 'Year',
    licenseplate: 'Registration number',

    // Tyre hotel
    tireHotelStorage: 'Tyre Hotel',
    storeTires: 'Store your tyres',
    tireStorage: 'We store your tyres over the season — cleaned, marked and ready.',
    storageFeatures: [
      'Cleaning & inspection at drop-off',
      'Climate-controlled storage — prevent cracks',
      'Reminder before season change',
      '4 wheels from 695 kr / season'
    ],
    learnMore: 'Learn more',
    bookStorage: 'Book drop-off',

    // Buttons & CTA
    bookService: 'Book service',
    readMore: 'Read more',
    viewMore: 'View more',
    quickInfo: 'Quick facts',
    serviceTime: 'Time',
    priceFrom: 'Price from',

    // Contact
    contact: 'Contact',
    address: 'Musköstgatan 2, Helsingborg',
    phone: '042-16 08 39',
    email: 'info@dackcentrum.se',
    hours: 'Hours',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    open: 'Open',
    closed: 'Closed',

    // Footer
    followUs: 'Follow us',
    quickLinks: 'Quick links',
    privacy: 'Privacy',
    terms: 'Terms',
    copyright: '© 2024 Däckcentrum. All rights reserved.',

    // Messages
    successOrderCreated: 'Order created successfully!',
    errorOrderFailed: 'Failed to create order. Try again.',
    successAdded: 'Added to cart',
    errorLoading: 'Failed to load data. Try again.',
  }
};

class I18n {
  constructor() {
    this.lang = this.getStoredLanguage();
    this.listeners = [];
  }

  getStoredLanguage() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('dc-lang');
      if (stored && TRANSLATIONS[stored]) return stored;
    }
    // Try document lang attribute
    if (typeof document !== 'undefined') {
      const docLang = document.documentElement.lang;
      if (docLang && TRANSLATIONS[docLang]) return docLang;
    }
    // Default to Swedish
    return 'sv';
  }

  setLanguage(lang) {
    if (!TRANSLATIONS[lang]) {
      console.warn(`Language ${lang} not found`);
      return;
    }
    this.lang = lang;
    try {
      localStorage.setItem('dc-lang', lang);
    } catch (e) {}

    // Update document lang
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }

    // Notify listeners
    this.listeners.forEach(cb => cb(lang));
  }

  get(key, defaultValue = '') {
    const keys = key.split('.');
    let value = TRANSLATIONS[this.lang];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || defaultValue || key;
  }

  t(key, defaultValue) {
    return this.get(key, defaultValue);
  }

  getCurrentLanguage() {
    return this.lang;
  }

  getAvailableLanguages() {
    return Object.keys(TRANSLATIONS);
  }

  onLanguageChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
}

export const i18n = new I18n();

// React hook for language support
export function useI18n() {
  const [lang, setLang] = React.useState(i18n.getCurrentLanguage());

  React.useEffect(() => {
    const unsubscribe = i18n.onLanguageChange(setLang);
    return unsubscribe;
  }, []);

  const t = (key, defaultValue) => i18n.t(key, defaultValue);
  const setLanguage = (newLang) => i18n.setLanguage(newLang);

  return { lang, t, setLanguage };
}

export default i18n;
