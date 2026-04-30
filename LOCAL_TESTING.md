# Local Testing Guide

Everything is set up to run **locally on your PC** before deploying to Vercel.

---

## ✅ Quick Start (3 steps)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Start Local Server
```bash
npm run server
# or: npm start
# or: node server.js
```

You should see:
```
✅ Local Development Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Open: http://localhost:5000
```

### 3️⃣ Open in Browser
Go to: **http://localhost:5000**

---

## 🧪 What You Can Test

### **Test Number Plate Search**
1. Go to **Shop** page
2. Enter a Swedish plate (e.g., `ABC123` or `ABC 123`)
3. Click **"Sök"** (Search)
4. Should show: Car info + matching tires with prices

### **Test Service Booking**
1. Go to any service page (e.g., Däckskifte)
2. Click **"Boka tid"** or **"Boka nu"**
3. Fill the form:
   - Name, Phone, Email (required)
   - Plate (optional)
   - Date (required)
   - Message (optional)
4. Click **"Boka tid"**
5. Should see: ✓ Confirmation message
6. Booking saved to **`bookings.json`** in project root

### **Test Checkout**
1. Go to Shop, search for tires
2. Click **"Lägg i varukorg"** (Add to cart)
3. Go to **Checkout**
4. Fill customer info
5. Click **"Skicka beställning"** (Place order)
6. Should redirect to **Order Confirmation**

### **View Stored Bookings**
Open **`bookings.json`** in your editor:
```json
[
  {
    "id": "uuid...",
    "name": "John Doe",
    "phone": "070-123 45 67",
    "email": "john@example.com",
    "service": "Däckskifte",
    "date": "2026-05-10",
    "createdAt": "2026-04-30T...",
    "status": "pending"
  }
]
```

Or call API directly:
```bash
curl http://localhost:5000/api/bookings
```

---

## 🔧 How It Works

### **Server Features**
- ✅ Serves all HTML/CSS/JS files
- ✅ Handles API requests (`/api/*`)
- ✅ Proxies to EonTyre API
- ✅ Stores bookings in `bookings.json`

### **Request Flow**
```
Browser (http://localhost:5000)
    ↓
Local Node.js Server (server.js)
    ├─ Serves HTML/CSS/JS (static files)
    ├─ /api/products → EonTyre API
    ├─ /api/orders → EonTyre API
    └─ /api/bookings → bookings.json
```

---

## 📋 API Endpoints (Local)

All available at `http://localhost:5000/api/`:

### **GET `/api/products`**
**Plate search:**
```bash
curl "http://localhost:5000/api/products?plate=ABC123"
```

**Direct size search:**
```bash
curl "http://localhost:5000/api/products?width=205&ratio=55&diameter=16"
```

**With filters:**
```bash
curl "http://localhost:5000/api/products?plate=ABC123&type=1"
```

Response:
```json
{
  "car": {
    "make": "Volvo",
    "model": "V70",
    "year": 2018,
    "tireDimension": "205/55R16"
  },
  "products": [
    {
      "id": 123,
      "name": "Michelin Pilot Sport 4",
      "brand": "Michelin",
      "dimension": "205/55R16",
      "price": 129900,
      "priceFormatted": "1 299 kr",
      "seasonType": "Summer",
      "stock": 15
    }
  ]
}
```

### **GET `/api/brands`**
```bash
curl http://localhost:5000/api/brands
```

### **POST `/api/vehicle`**
```bash
curl -X POST http://localhost:5000/api/vehicle \
  -H "Content-Type: application/json" \
  -d '{"plate":"ABC123"}'
```

### **POST `/api/orders`**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {"name":"John","email":"john@ex.com","phone":"070-123"},
    "products": [{"id":123,"quantity":1,"price":129900}],
    "delivery_option": 0
  }'
```

### **GET `/api/orders/:id`**
```bash
curl "http://localhost:5000/api/orders?id=ORDER_ID"
```

### **POST `/api/bookings`**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "070-123 45 67",
    "email": "john@example.com",
    "plate": "ABC123",
    "service": "Däckskifte",
    "date": "2026-05-10",
    "message": "Please call before"
  }'
```

### **GET `/api/bookings`** (admin)
```bash
curl http://localhost:5000/api/bookings
```

---

## 🐛 Troubleshooting

### **"Port 5000 already in use"**
Kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

Or use a different port by editing `server.js`:
```js
const PORT = 3000; // Change this
```

### **"Cannot find module '@vercel/kv'"**
Run:
```bash
npm install
```

### **"API calls fail with CORS error"**
The server has CORS enabled. If still getting errors, check:
- Browser console (F12) for actual error message
- Is server running? (http://localhost:5000 should load)
- Is endpoint path correct? (check API_ENDPOINTS.md)

### **"Bookings not saving"**
- Check if `bookings.json` exists in project root
- Check file permissions (should be readable/writable)
- Check server console for errors

### **"EonTyre API returns 401/403"**
- API key might be wrong in `server.js` (line with `EONTYRE_API_KEY`)
- Check if EonTyre API is up: https://p511.eontyre.com/api/doc

---

## 📝 Development Workflow

```
1. npm install          # Install dependencies
2. npm run server       # Start local server
3. http://localhost:5000  # Open in browser
4. Test features
5. Check bookings.json  # View stored data
6. Make code changes
7. Refresh browser
8. When ready: git push
9. Vercel auto-deploys
```

---

## ✨ What's Different from Vercel Deployment

| Feature | Local | Vercel |
|---------|-------|--------|
| Server | Node.js (server.js) | Vercel Functions |
| Bookings Storage | JSON file | Vercel KV |
| Base URL | http://localhost:5000 | Your Vercel domain |
| Env Variables | hardcoded in server.js | Vercel Dashboard |
| CORS | Enabled | Enabled |

---

## 🚀 When Ready to Deploy to Vercel

1. Make sure everything works locally ✅
2. Commit to git:
   ```bash
   git add .
   git commit -m "feat: EonTyre API integration with local testing"
   git push
   ```

3. Go to Vercel Dashboard
4. Set up Vercel KV (one time)
5. Add environment variables
6. Vercel auto-deploys from git

The `api/` folder functions will automatically work on Vercel (no code changes needed).

---

## 💡 Tips

- **Clear browser cache** (Ctrl+Shift+Delete) if you see old data
- **Check browser console** (F12 → Console) for JavaScript errors
- **Check server console** for API/backend errors
- **Inspect Network tab** (F12 → Network) to see API calls
- **Use `curl`** to test API without browser issues
