# English Language Implementation Guide

## Status: ✅ Header Translation Complete

The header and top navigation now fully support English translations. When you click the "EN" button, the following will be translated:

- Navigation menu items
- Service book button
- Address and contact information
- Fast delivery message
- Return policy notice

---

## Where English Translation Has Been Implemented

### ✅ Already Implemented (Complete)

**Header Component (`components/header.jsx`):**
- ✅ Navigation menu (7 items with submenus)
- ✅ Top bar messaging (fast delivery, return policy)
- ✅ Address and phone display
- ✅ Book service button
- ✅ Aria labels for accessibility
- ✅ Language switcher buttons (SV/EN)
- ✅ Responsive to language changes via `languagechange` event

**Language System (`lib/init-lang.js`):**
- ✅ Language storage in localStorage
- ✅ Language switcher button event handlers
- ✅ Extended translation keys for all UI elements
- ✅ Language change event system

---

## Where English Translation Needs to Be Added

### 📝 To Be Implemented (Optional - Page Content)

For a fully translated experience, these sections should be updated:

**1. Home Page Hero Sections (app.jsx)**
```javascript
// Currently Swedish only
// Should add translations for hero text, descriptions
```

**2. Service Sections (components/sections.jsx)**
```javascript
const SERVICES = [
  { name: "Däckskifte", desc: "..." }, // Needs English
  { name: "Balansering", desc: "..." },
  // ... 7 more services
];
```

**3. Tyre Hotel Page (dackhotell.html)**
- Hero section title and description
- Flow steps (4 steps)
- Pricing information
- Features list

**4. About Page (om-oss.html)**
- Timeline events
- Company values
- History text

**5. Service Pages (tjanst-*.html)**
- Each service page title and description
- Service details

---

## Current Translation Coverage

### ✅ Fully Translated (Header)
| Section | Swedish | English | Status |
|---------|---------|---------|--------|
| Navigation Menu | ✅ | ✅ | Complete |
| Top Bar Info | ✅ | ✅ | Complete |
| Book Button | ✅ | ✅ | Complete |
| Language Toggle | ✅ | ✅ | Complete |
| Aria Labels | ✅ | ✅ | Complete |

### ⚠️ Partially Translated (Requires Manual)
| Section | Swedish | English | Status |
|---------|---------|---------|--------|
| Hero Sections | ✅ | ❌ | Needs work |
| Services | ✅ | ❌ | Needs work |
| Tyre Hotel | ✅ | ❌ | Needs work |
| About Page | ✅ | ❌ | Needs work |
| FAQ Section | ✅ | ❌ | Needs work |

---

## How to Add English to Components

### Method 1: Update Translation Dictionaries

Add your English translations to the language system:

**In `lib/init-lang.js`:**
```javascript
window.DC_LANG.translations.en = {
  // Add new keys
  ourServices: 'Our Services',
  tireReplacement: 'Tire Fitting',
  fastService: 'Fast and professional service',
  // ... more keys
};

window.DC_LANG.translations.sv = {
  ourServices: 'Våra tjänster',
  tireReplacement: 'Däckskifte',
  fastService: 'Snabb och professionell service',
  // ... more keys
};
```

### Method 2: Use React Hook for Dynamic Translation

**In React components:**
```javascript
function MyComponent() {
  const [lang, setLang] = React.useState(window.DC_LANG?.current || 'sv');

  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLang(window.DC_LANG?.current || 'sv');
    };
    document.addEventListener('languagechange', handleLanguageChange);
    return () => document.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  return (
    <h1>
      {lang === 'en' ? 'Our Services' : 'Våra tjänster'}
    </h1>
  );
}
```

### Method 3: Use Translation Dictionary

**In React components:**
```javascript
function MyComponent() {
  const getText = (key) => window.DC_LANG?.get(key) || '';

  return (
    <h1>{getText('ourServices')}</h1>
  );
}
```

---

## Complete Navigation Translation

### Swedish Navigation
```
Däck
├── Sommardäck (Säsong)
├── Vinterdäck
├── Helårsdäck
├── Begagnade däck
└── Kampanjer (Rea)

Fälg
├── Stålfälg
├── Aluminiumfälg
└── DC Wheels (Nytt)

Kompletta hjul
Däckhotell
Hjulinställning
Fälgrenovering
DC Wheels
```

### English Navigation (Now Implemented)
```
Tyres
├── Summer Tyres (Season)
├── Winter Tyres
├── All-Season Tyres
├── Used Tyres
└── Sale (Sale)

Rims
├── Steel Rims
├── Aluminum Rims
└── DC Wheels (New)

Complete Wheels
Tyre Hotel
Wheel Alignment
Rim Service
DC Wheels
```

---

## Testing English Translation

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Click EN Button
- Navigate to the header
- Click the "EN" button in top-right
- The header should immediately switch to English

### Step 3: Verify Translations
- ✅ Navigation menu items changed
- ✅ Top bar message changed
- ✅ "Book service" button text changed
- ✅ "EN" button is now highlighted

### Step 4: Reload Page
- English should persist (stored in localStorage)
- Header should load in English on page refresh

---

## Services Requiring English Translation

### 7 Main Services
1. **Däckskifte** → "Tyre Fitting"
   - Description: "Wheel replacement with balancing, inspection and torque"

2. **Balansering** → "Balancing"
   - Description: "Precision balancing on Hofmann machine for smooth rolling"

3. **Hjulinställning** → "Wheel Alignment"
   - Description: "3D measurement and adjustment of camber, toe and caster"

4. **Punktering** → "Puncture Repair"
   - Description: "Quick check and assessment, usually while you wait"

5. **Lagning** → "Repair"
   - Description: "Steam sealing or plugging — we recommend the right solution"

6. **Fälgrenovering** → "Rim Service"
   - Description: "Renovation, straightening and painting of aluminum and steel rims"

7. **Däckhotell** → "Tyre Hotel"
   - Description: "We store your tires over the season — washed, marked and ready"

---

## How to Complete Full Translation

### Quick Implementation (Minimal)
1. Update `SERVICES` array in `components/sections.jsx` with English strings
2. Add language check to render appropriate text
3. Test with language switcher

### Comprehensive Implementation
1. Add all text to `lib/init-lang.js` translation dictionaries
2. Update all React components to use `window.DC_LANG.get()`
3. Wrap page content in language-aware components
4. Test all pages in both languages

---

## Language System Architecture

```
Header Component (React)
    ↓
Language Buttons (data-lang="en"|"sv")
    ↓
init-lang.js (Event Listeners)
    ↓
window.DC_LANG.set(lang)
    ↓
localStorage.setItem('dc-lang', lang)
    ↓
'languagechange' Event
    ↓
React Components Listen & Update
    ↓
UI Re-renders with New Language
```

---

## File Locations

**Language System Files:**
- `lib/init-lang.js` - Language initialization and storage
- `lib/i18n.js` - React i18n system (optional, for React components)

**Component Files Needing Updates:**
- `components/header.jsx` - ✅ DONE
- `components/sections.jsx` - ⚠️ TODO
- `app.jsx` - ⚠️ TODO (if using translations)
- `components/heroes.jsx` - ⚠️ TODO (if using translations)

**HTML Files:**
- `index.html` - May need text updates
- `dackhotell.html` - ⚠️ TODO
- `om-oss.html` - ⚠️ TODO
- Service pages - ⚠️ TODO

---

## Current Implementation: Header Only

### What Works Now ✅
- Click "EN" in top-right
- Navigation changes to English
- All menu items translated
- Top bar message translated
- Book button translated
- Language persists on reload

### What Doesn't Work Yet ❌
- Page hero sections (still Swedish)
- Service descriptions (still Swedish)
- FAQ content (still Swedish)
- About page content (still Swedish)
- Service detail pages (still Swedish)

---

## Next Steps to Complete Translation

### Option 1: Minimal Effort
Just translate the navigation and book button (✅ DONE)

### Option 2: Moderate Effort
Add English to main sections (hero, services, about)
- Time: ~1 hour
- Effort: Medium
- Result: 80% translated experience

### Option 3: Complete Translation
Translate entire site including all pages and content
- Time: ~2-3 hours
- Effort: High
- Result: 100% bilingual site

---

## Example: How to Add English to Services

**Current (Swedish only):**
```javascript
const SERVICES = [
  { name: "Däckskifte", desc: "..." },
  // ...
];
```

**Updated (Bilingual):**
```javascript
function getServices() {
  const lang = window.DC_LANG?.current || 'sv';
  
  if (lang === 'en') {
    return [
      { name: "Tyre Fitting", desc: "Wheel replacement with balancing, inspection and torque." },
      // ... more services in English
    ];
  }
  
  return [
    { name: "Däckskifte", desc: "..." },
    // ... Swedish services
  ];
}

// Use in component:
{getServices().map((s) => (...))}
```

---

## Recommended Action

Since the header is now fully English-enabled, here's what you should do:

1. ✅ **Header** - Complete (language switcher working)
2. ⚠️ **Services Section** - Add English translations (easy, 15 min)
3. ⚠️ **Hero Sections** - Add English translations (medium, 30 min)
4. ⚠️ **Other Pages** - Add translations as needed

---

## Support

For questions about the English translation implementation:

1. Check this guide
2. Review `lib/init-lang.js` for translation dictionary structure
3. Review updated `components/header.jsx` for implementation examples
4. Test in browser with language switcher

---

**Status: Header English Translation ✅ COMPLETE**  
**Status: Full Site Translation ⚠️ IN PROGRESS**  

**Next: Update service sections and other components with English content**
