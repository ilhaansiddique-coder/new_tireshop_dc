# EonTyre API Integration - Setup Guide

## ✅ Implementation Complete

The following has been implemented:

### 1. **5 Vercel Serverless Functions (api/ folder)**
- `api/products.js` — Plate search + tire size search with real EonTyre API
- `api/vehicle.js` — Car lookup by license plate
- `api/brands.js` — Tire brands list
- `api/orders.js` — Create and retrieve orders (proxies to EonTyre)
- `api/bookings.js` — Service booking storage (uses Vercel KV)

### 2. **New Component**
- `components/booking-modal.jsx` — Slide-in modal for service bookings

### 3. **Updated Pages**
- `pages/ShopPage.jsx` — Now has plate search, real product API, and season filters
- `components/stub-page.jsx` — "Boka tid" buttons now open booking modal
- `pages/CheckoutPage.jsx` — Uses `/api/orders` instead of localhost
- `pages/OrderConfirmationPage.jsx` — Uses `/api/orders` instead of localhost
- All 6 service pages updated with booking-modal script

### 4. **Configuration**
- `vercel.json` — Updated with environment variable references
- `.env.local` — Updated with EonTyre API URL and new config
- `package.json` — Added `@vercel/kv` and `uuid` dependencies

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies Locally
```bash
npm install
```

### Step 2: Set Up Vercel KV (One-time Setup)

The service booking feature uses Vercel KV (Redis) for storage. Follow these steps:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** → **Create Database** → **KV**
4. Click **Connect Project** and select this project
5. Vercel will auto-add three environment variables:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

6. Pull environment variables locally:
   ```bash
   vercel env pull .env.local
   ```

### Step 3: Set Environment Variables in Vercel Dashboard

Go to **Settings** → **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `EONTYRE_API_URL` | `https://p511.eontyre.com` |
| `EONTYRE_API_KEY` | `b9b77f6e3a2448d58cc289fb6e961c77` |

(The KV variables are auto-added in Step 2)

### Step 4: Deploy to Vercel

```bash
vercel deploy
```

Or push to GitHub if you have GitHub integration enabled on Vercel (it will auto-deploy).

---

## 🧪 Testing Locally

### Start Local Development Server
```bash
npm run dev
```

This opens http://localhost:8080 with http-server.

### Test Number Plate Search (Shop Page)

1. Go to `http://localhost:8080/shop.html`
2. Enter a Swedish license plate (e.g., `ABC123`)
3. Click "Sök" (Search)
4. Should see: Car info + matching tires with brand, size, price, season type

> **Note:** Local development won't work for bookings without Vercel KV setup. The function will error, but it will work once deployed to Vercel.

### Test Service Booking

1. Go to a service page, e.g., `http://localhost:8080/tjanst-dackskifte.html`
2. Click "Boka tid" or "Boka nu"
3. Fill the form and submit
4. On Vercel deployment, booking will be stored in KV

### Test Checkout Flow

1. Go to shop, add a tire to cart
2. Go to checkout (`/checkout.html`)
3. Fill customer info and submit
4. On Vercel deployment, order will be created in EonTyre

---

## 📋 What Each Endpoint Does

### GET `/api/products?plate=ABC123`
Searches for tires by car license plate:
- Looks up car model + tire size from EonTyre
- Returns car info + matching tires

**Response:**
```json
{
  "car": { "make": "Volvo", "model": "V70", "year": 2018, "tireDimension": "205/55R16" },
  "products": [
    {
      "id": 123,
      "name": "Michelin Pilot Sport 4",
      "brand": "Michelin",
      "dimension": "205/55R16",
      "price": 129900,
      "seasonType": "Summer",
      "stock": 15,
      "image": "https://..."
    }
  ]
}
```

### GET `/api/products?width=205&ratio=55&diameter=16`
Direct tire size search (optional):
- Bypasses car lookup
- Returns matching tires only

### GET `/api/brands`
Returns list of tire brands.

### POST `/api/orders`
Creates an order in EonTyre:
- Headers: `Content-Type: application/json`
- Body: Order data with customer, products, delivery option
- Returns: Order ID

### POST `/api/bookings`
Creates a service booking in Vercel KV:
- **Body:** `{ name, phone, email, service, date, plate?, message? }`
- **Returns:** `{ id: <bookingId>, message: "Booking created", booking: {...} }`

### GET `/api/bookings` (admin)
Lists all bookings from Vercel KV:
- Returns: `{ count, bookings: [...] }`

---

## 🔐 Security Notes

1. **API Key Protected:** The EonTyre API key is now server-side only. Browsers cannot see it.
2. **Bookings Stored:** Service bookings are stored in Vercel KV with 90-day expiry.
3. **No Auth Required:** Bookings don't require customer login (as per requirements).

---

## 🛠 Troubleshooting

### "Vercel functions not found" 
- Make sure you ran `npm install` to add `@vercel/kv`
- Verify `api/` folder exists with `.js` files

### "KV error on /api/bookings"
- KV is not set up yet. Follow Step 2 above.
- Locally, this endpoint will fail. It works once deployed.

### "Product search returns no results"
- The EonTyre API might not have that tire size in stock
- Check the EonTyre dashboard or try a different plate

### "Order creation fails"
- Verify customer data is complete (name, phone, email)
- Check that order items are valid (prices, quantities)

---

## 📱 Key Features Implemented

✅ **License plate search** — Find exact tires for a car  
✅ **Season filter** — Summer/Winter/All-season toggle  
✅ **Service booking** — Modal form on all service pages  
✅ **Order proxy** — Checkout now uses secure Vercel Functions  
✅ **Real products** — No more hardcoded demo data  
✅ **Booking storage** — Vercel KV (free tier)  

---

## 📚 Next Steps (Optional)

1. **Email Notifications** — Send booking/order emails (requires email service)
2. **Admin Dashboard** — Simple page to view all bookings from `/api/bookings`
3. **Stock Sync** — Background job to sync live stock from EonTyre
4. **Inventory Management** — Track bookings by availability
5. **Payment Integration** — If future payment processing needed

---

## 📞 Support

For issues with:
- **EonTyre API**: Contact support@eontyre.com
- **Vercel Deployment**: [Vercel Docs](https://vercel.com/docs)
- **This Setup**: Check the plan file at `.claude/plans/wild-cooking-orbit.md`
