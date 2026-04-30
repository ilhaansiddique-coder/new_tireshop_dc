/**
 * Language System Initialization
 * Sets up language switching and persistence
 */

// Simplified i18n for vanilla JS (without React dependency)
window.DC_LANG = {
  current: localStorage.getItem('dc-lang') || document.documentElement.lang || 'sv',

  translations: {
    sv: {
      // Navigation
      home: 'Hem',
      tires: 'Däck',
      rims: 'Fälg',
      completeWheels: 'Kompletta hjul',
      tireHotel: 'Däckhotell',
      wheelAlignment: 'Hjulinställning',
      rimService: 'Fälgrenovering',

      // Services
      summerTires: 'Sommardäck',
      winterTires: 'Vinterdäck',
      allSeasonTires: 'Helårsdäck',
      usedTires: 'Begagnade däck',
      campaigns: 'Kampanjer',
      steelRims: 'Stålfälg',
      aluminumRims: 'Aluminiumfälg',
      dcWheels: 'DC Wheels',

      // Search & forms
      findTiresForCar: 'Hitta däck till din bil',
      enterPlateNumber: 'Ange regnummer',
      search: 'Sök',
      bookService: 'Boka tid',

      // Messages
      loading: 'Laddar...',
      noResults: 'Inga resultat hittades',
      error: 'Ett fel uppstod',

      // Links
      readMore: 'Läs mer',
      contact: 'Kontakt',
      aboutUs: 'Om oss',
      services: 'Tjänster',

      // Topbar
      fastDelivery: 'Snabb leverans',
      daysReturnPolicy: '14 dagars öppet köp',
      address: 'Musköstgatan 2, Helsingborg',
      phone: '042-16 08 39',

      // Theme
      lightMode: 'Ljust läge',
      darkMode: 'Mörkt läge',
      switchToLight: 'Byt till ljust läge',
      switchToDark: 'Byt till mörkt läge'
    },
    en: {
      // Navigation
      home: 'Home',
      tires: 'Tyres',
      rims: 'Rims',
      completeWheels: 'Complete Wheels',
      tireHotel: 'Tyre Hotel',
      wheelAlignment: 'Wheel Alignment',
      rimService: 'Rim Service',

      // Services
      summerTires: 'Summer Tyres',
      winterTires: 'Winter Tyres',
      allSeasonTires: 'All-Season Tyres',
      usedTires: 'Used Tyres',
      campaigns: 'Campaigns',
      steelRims: 'Steel Rims',
      aluminumRims: 'Aluminum Rims',
      dcWheels: 'DC Wheels',

      // Search & forms
      findTiresForCar: 'Find tyres for your car',
      enterPlateNumber: 'Enter registration number',
      search: 'Search',
      bookService: 'Book service',

      // Messages
      loading: 'Loading...',
      noResults: 'No results found',
      error: 'An error occurred',

      // Links
      readMore: 'Read more',
      contact: 'Contact',
      aboutUs: 'About us',
      services: 'Services',

      // Topbar
      fastDelivery: 'Fast delivery',
      daysReturnPolicy: '14 days return policy',
      address: 'Musköstgatan 2, Helsingborg',
      phone: '042-16 08 39',

      // Theme
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode'
    }
  },

  set(lang) {
    if (this.translations[lang]) {
      this.current = lang;
      document.documentElement.lang = lang;
      document.documentElement.dataset.lang = lang;
      localStorage.setItem('dc-lang', lang);
      this.triggerUpdate();

      // Force React components to update by triggering a global event
      window.dispatchEvent(new CustomEvent('dc-language-changed', { detail: { lang } }));
    }
  },

  get(key, defaultValue = '') {
    return this.translations[this.current]?.[key] || defaultValue;
  },

  getCurrent() {
    return this.current;
  },

  triggerUpdate() {
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: this.current } }));
  }
};

// Initialize language switching
function initLanguageSwitching() {
  // Set initial language on document
  document.documentElement.lang = window.DC_LANG.current;
  document.documentElement.dataset.lang = window.DC_LANG.current;

  // Add click handlers to language buttons
  const langButtons = document.querySelectorAll('[data-lang]');

  const updateButtonStates = () => {
    langButtons.forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      if (lang === window.DC_LANG.current) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  // Initial button state
  updateButtonStates();

  // Add click handlers
  langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-lang');
      if (lang && lang !== window.DC_LANG.current) {
        window.DC_LANG.set(lang);
        updateButtonStates();
        console.log('✓ Language changed to:', lang);
      }
    });
  });

  // Listen for language changes
  document.addEventListener('languagechange', updateButtonStates);
  window.addEventListener('dc-language-changed', updateButtonStates);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageSwitching);
} else {
  initLanguageSwitching();
}

// Reinitialize if new buttons are added dynamically
const observer = new MutationObserver(() => {
  const langButtons = document.querySelectorAll('[data-lang]');
  if (langButtons.length > 0) {
    langButtons.forEach(btn => {
      if (!btn.dataset.initialized) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = btn.getAttribute('data-lang');
          if (lang && lang !== window.DC_LANG.current) {
            window.DC_LANG.set(lang);
            console.log('✓ Language changed to:', lang);
          }
        });
        btn.dataset.initialized = 'true';
      }
    });
  }
});

observer.observe(document.body, { childList: true, subtree: true });
