# Däckcentrum — Frontend Application

A modern, responsive tire shop management system built with React 18, connecting to EONTYRE APIs for product, order, and service management.

## Features

✅ **Multi-language support** (Swedish & English)  
✅ **Vehicle lookup** by license plate  
✅ **Product search** (tyres, rims, complete wheels)  
✅ **Order management** (create, view, list)  
✅ **Stock tracking** (real-time availability)  
✅ **Tyre hotel** service management  
✅ **Responsive design** (mobile-first)  
✅ **Dark/Light themes** with customization  
✅ **Full EONTYRE API integration**

## Project Structure

```
.
├── components/              # React components
│   ├── header.jsx          # Header with navigation
│   ├── sections.jsx        # Page sections
│   ├── regsearch.jsx       # License plate search
│   ├── tire.jsx            # Tire visualization
│   ├── heroes.jsx          # Hero sections
│   └── icons.jsx           # SVG icons
├── lib/                     # Utility libraries
│   ├── api.js              # EONTYRE API client
│   ├── i18n.js             # Internationalization (React)
│   ├── init-lang.js        # Language initialization (vanilla JS)
│   └── api-test.js         # API testing utilities
├── styles/                  # CSS styles
│   ├── tokens.css          # Design tokens
│   ├── header.css          # Header styles
│   ├── sections.css        # Section styles
│   └── subpage.css         # Subpage styles
├── pages (HTML files)      # Static pages
│   ├── index.html          # Home page
│   ├── dackhotell.html     # Tyre hotel
│   ├── om-oss.html         # About us
│   └── tjanst-*.html       # Service pages
├── app.jsx                 # Main app component
├── tweaks-panel.jsx        # Theme/tweak controls
├── API_DOCUMENTATION.md    # Complete API docs
├── .env.local              # Environment config
├── .env.example            # Example config
└── package.json            # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 14+ (for development server)
- Modern browser (Chrome, Firefox, Safari, Edge)
- EONTYRE API key (contact support)

### Installation

1. **Clone or download the project**

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your EONTYRE API key:
```env
REACT_APP_EONTYRE_API_KEY=your_api_key_here
BACKEND_API_URL=http://api.eontyre.com
```

4. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:8080`

## Configuration

### Environment Variables (`.env.local`)

```env
# EONTYRE Backend API
BACKEND_API_URL=http://127.0.0.1:4000
INTERNAL_API_URL=http://127.0.0.1:4000

# API Authentication
REACT_APP_EONTYRE_API_KEY=your_api_key_here

# Default Language
REACT_APP_DEFAULT_LANG=sv  # sv (Swedish) or en (English)
```

### Language System

The app supports Swedish (sv) and English (en). Language preference is:

1. Stored in `localStorage` 
2. Can be switched via the language toggle (top-right)
3. Persists across sessions
4. Falls back to browser language or Swedish

**To add/update translations:**
Edit `lib/i18n.js` and add keys to both `sv` and `en` objects.

### Theme Customization

Use the **Tweaks panel** (bottom-right) to:
- Switch hero variants (3 options)
- Toggle light/dark theme
- Change accent color (green, orange, blue)
- Change font (Inter, Space Grotesk, Serif)

Settings are stored in `localStorage` and persist.

## API Integration

### Using the API Client

```javascript
import * as API from './lib/api.js';

// Search products
const products = await API.fetchProducts({
  query: "195/65R15",
  page: 1,
  limit: 25
});

// Look up vehicle
const vehicle = await API.fetchVehicleByPlate("ABC123");

// Create order
const order = await API.createOrder({
  customer: { ... },
  products: [ ... ]
});

// Get tyre hotel details
const hotel = await API.fetchTyrehotelDetail(hotelId);
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Testing API Endpoints

Test all endpoints in the browser console:

```javascript
// Run all tests
await window.APITests.runAll();

// Test specific endpoint
await window.APITests.testVehicleByPlate('ABC123');
await window.APITests.testProductSearch('195/65R15');
await window.APITests.testTyreProducts();
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for all available tests.

## Component Usage

### RegSearch (License Plate Search)

```jsx
import DCRegSearch from './components/regsearch.jsx';

<DCRegSearch 
  label="Find tyres for your car"
  help="Enter your license plate"
  onSearch={(plate) => {
    // Handle search
  }}
/>
```

### Product Display

```jsx
import * as API from './lib/api.js';

const [products, setProducts] = useState([]);

useEffect(() => {
  API.fetchProducts({ query: "195/65R15" })
    .then(result => setProducts(result.products));
}, []);

{products.map(p => (
  <div key={p.id}>
    <img src={API.productImageUrl(p)} alt={p.name}/>
    <h3>{p.name}</h3>
    <p>{API.formatPrice(p.price)}</p>
  </div>
))}
```

### Multi-language Component

```jsx
import { useI18n } from './lib/i18n.js';

function MyComponent() {
  const { t, lang } = useI18n();

  return (
    <div>
      <h1>{t('findTiresForCar')}</h1>
      <p>Current language: {lang}</p>
    </div>
  );
}
```

## Pages & Routes

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Main landing page |
| Tyre Hotel | `/dackhotell.html` | Tyre storage service |
| About | `/om-oss.html` | Company information |
| Services | Multiple | Service pages (tire fitting, balancing, etc.) |

All pages include:
- Header with navigation
- TopBar with language/theme controls
- Footer
- Responsive mobile layout

## Styling

### Design Tokens

Colors, spacing, typography are defined in `styles/tokens.css`:

- **Colors**: `--ink`, `--bg`, `--accent`, etc.
- **Spacing**: `--pad-section`, `--pad-small`, etc.
- **Typography**: `--font-display`, `--font-body`, `--font-mono`
- **Transitions**: `--t-fast`, `--t-med`, `--t-slow`

### Theme Variables

- `data-theme="light"|"dark"` - Theme attribute
- `data-accent="green"|"orange"|"blue"` - Accent color
- CSS variables update automatically based on theme

## Performance

- **Lazy loading**: Images load on-demand
- **Code splitting**: Components loaded via Babel
- **Caching**: LocalStorage for language/theme preferences
- **Image optimization**: EONTYRE CDN for product images
- **No build step**: Direct JSX compilation with Babel

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Troubleshooting

### API Connection Failed

**Error:** "API error: 401" or "API error: 403"

**Solution:**
1. Check API key in `.env.local`
2. Verify `BACKEND_API_URL` is correct
3. Confirm API key hasn't expired (contact EONTYRE support)

### Language Not Switching

**Solution:**
1. Check browser console for errors
2. Verify `lib/init-lang.js` is loaded
3. Clear localStorage: `localStorage.clear()`

### Products Not Loading

**Solutions:**
1. Check network tab in DevTools
2. Verify API endpoint returns data
3. Check CORS headers (may need backend configuration)
4. Test with `await APITests.testProductSearch()`

### Theme Not Applying

**Solution:**
1. Verify CSS files are loaded (check Network tab)
2. Check CSS variable syntax in `styles/tokens.css`
3. Clear browser cache: `Ctrl+Shift+Del`

## Development

### Adding a New Component

1. Create file in `components/`
2. Define React component
3. Export to window global: `window.MyComponent = MyComponent;`
4. Import in HTML: `<script type="text/babel" src="components/mycomponent.jsx"></script>`

### Adding a New API Endpoint

1. Add function to `lib/api.js`
2. Follow naming pattern: `fetchResourceName(params)`
3. Use `apiRequest()` for HTTP calls
4. Return normalised response
5. Add test in `lib/api-test.js`

### Adding Translations

1. Edit `lib/i18n.js`
2. Add key to both `sv` and `en` objects
3. Use in components: `t('myNewKey')`

## Building for Production

Currently no build step required. For a production build with optimization:

```bash
npm run build
# Output: dist/ (optimized static files)
```

Deploy the entire project folder to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Traditional web server

## Security

- ✅ API keys stored in server environment (not exposed to client)
- ✅ All API calls validated server-side
- ✅ HTTPS recommended for production
- ✅ No sensitive data stored in localStorage
- ✅ XSS protection via React's built-in escaping

## License

© 2024 Däckcentrum. All rights reserved.

## Support

For issues or questions:

1. **API Issues**: Contact EONTYRE support
2. **Frontend Issues**: Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. **Local Testing**: Run `APITests.runAll()` in console

## Version History

- **v1.0.0** (2024-04-30) - Initial release
  - Full EONTYRE API integration
  - Multi-language support (SV, EN)
  - Theme customization
  - Responsive design
  - Tyre hotel management
  - Order management

---

**Built with ❤️ for Däckcentrum**
