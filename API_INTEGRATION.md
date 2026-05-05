# Däckcentrum — API & Integration Reference

End-to-end documentation of every dynamic flow on the site: tyre search, cart,
checkout, payment, courier booking, order confirmation. Use this as a recipe
to reproduce the same dynamic behaviour in a new project (e.g. when porting
the Claude-Design HTML/CSS into a new codebase).

> All public-facing routes are served by `server.js` (Node + Express). Front-end
> calls go through `fetch('/api/...')`. No authentication on the public API —
> the EonTyre / Qliro / Fraktjakt secrets live as env vars on the server only.

---

## Architecture at a glance

```
Browser                      server.js (Express)               External services
─────────                    ──────────────────                ──────────────────
ShopPage  ────fetch───────►  GET  /api/products       ────►   EonTyre webshop API
                                                              (cars + products)

CartManager (localStorage)                                    (no server call)

CheckoutPage ───fetch─────►  POST /api/shipping/query ────►   Fraktjakt query_xml
                             POST /api/qliro/create-checkout  Qliro Checkout
                             GET  /api/qliro/status/:id       (polling)
              ◄─── webhook   POST /api/qliro/callback   ◄───  Qliro server
                                                              ↓
                                                              EonTyre orders POST
                                                              Fraktjakt shipment_xml

ThankYou page ─────────────  reads confirmedOrder state from React (no fetch)
```

Three external APIs:
1. **EonTyre** — product catalogue and order persistence
2. **Qliro** — payment processing (with mock-mode fallback)
3. **Fraktjakt** — shipping rate quotes and shipment booking

---

## Environment variables

```env
# EonTyre product catalogue + orders
EONTYRE_API_URL=https://p511.eontyre.com
EONTYRE_API_KEY=<your-api-key>

# Qliro payment.
# Set QLIRO_API_KEY=DACKA to enable mock mode (auto-completes after 3s, no charge).
QLIRO_API_KEY=DACKA
QLIRO_API_SECRET=<your-secret>
QLIRO_API_URL=https://pago.qit.nu

# Fraktjakt shipping
FRAKTJAKT_CONSIGNOR_ID=<consignor-id>
FRAKTJAKT_CONSIGNOR_KEY=<consignor-key>
SHOP_ORIGIN_STREET=Musköstgatan 2
SHOP_ORIGIN_POSTAL=25220
SHOP_ORIGIN_CITY=Helsingborg

# Fraktjakt mode: "shipment" (admin picks carrier in Fraktjakt UI)
#                or "order" (Order API type 1, customer's chosen carrier)
FRAKTJAKT_BOOKING_MODE=shipment

# Public URL, used by Qliro for redirects. No trailing slash.
BASE_URL=https://your-domain.example
FRONTEND_URL=https://your-domain.example
```

---

## 1. Tyre search — `GET /api/products`

Three search modes; pass exactly one set of query params.

### 1a. By Swedish licence plate

```
GET /api/products?plate=AHA23R
```

Server flow:
1. `GET https://p511.eontyre.com/api/webshop/cars/{plate}` with `Api-Key` header
2. Reads `data.tyreStandardSize.{width,aspectRatio,diameter}` from response
3. `GET https://p511.eontyre.com/api/webshop/products?{params}` to pull tyres
4. Normalises the product list

### 1b. By dimension string

```
GET /api/products?dimension=225/50%20R16
```

Server parses `WIDTH/RATIO RDIAMETER` (also `225/50/16` or `225-50-16`).

### 1c. By exact width/ratio/diameter

```
GET /api/products?width=235&ratio=35&diameter=20&type=1&brand=DYNAMO
```

### Response shape

```json
{
  "car": { "make": "TESLA MOTORS", "model": "...", "year": 2019, "tireDimension": "235/35R20" },
  "products": [
    {
      "id": "eNw...",
      "productId": 101665101,
      "sku": "MPS4-22545R17",
      "name": "DYNAMO Street-H MU71 235/35R20 92Y",
      "brand": "DYNAMO",
      "model": "Street-H MU71",
      "dimension": "235/35-20 92Y",
      "loadIndex": "92",
      "speedIndex": "Y",
      "seasonType": "Sommar",
      "seasonTypeId": 1,
      "tyreTypeId": 2,
      "price": 113250,            // ÖRE (1/100 SEK)
      "priceFormatted": "1 133 kr",
      "stock": 32,
      "image": { "webshop_thumb": "https://api.eontyre.com/images/.../webshop_thumb.jpg", ... },
      "supplier_id": 503,
      "location_id": 0,
      "isEnforced": true,         // XL
      "isRunflat": false,
      "isSilence": false,
      "isStudded": false,
      "isElectricVehicle": false,
      "rollingResistance": "C",   // EU label A–G
      "wetGrip": "A",             // EU label A–G
      "noiseDecibel": 71,
      "noiseRating": "B",
      "eprelLabelImage": "https://eprel.ec.europa.eu/labels/.../Label_xxx.svg",
      "dotMark": "0125",
      "snowGrip": false,
      "iceGrip": false
    }
  ],
  "tiresFound": 50
}
```

### Front-end usage example

```js
async function searchByPlate(plate) {
  const res = await fetch(`/api/products?plate=${encodeURIComponent(plate.toUpperCase())}`);
  if (!res.ok) throw new Error(await res.text());
  const { car, products } = await res.json();
  return { car, products };
}
```

> **Important:** `price` is in öre. Always divide by 100 before formatting.

---

## 2. Other catalogue endpoints

### `GET /api/brands`
Returns list of brands the shop carries. Used by the brand filter dropdown.

### `POST /api/vehicle`
Body: `{ "plate": "AHA23R" }` — proxy to EonTyre car lookup, returns vehicle info only (no products). Used by the home-page "Sök på regnummer" widget when redirecting to shop.

### `POST /api/orders` — record an EonTyre order

Body matches EonTyre's order shape:
```json
{
  "customer": {
    "type": 2,
    "name": "Asif Khan",
    "address1": "Testgatan 1",
    "postal_code": "25220",
    "city": "Helsingborg",
    "country": "SE",
    "email": "x@y.com",
    "phone": "+46...",
    "update": true
  },
  "products": [
    { "id": 101702907, "quantity": 4, "location_id": 1048 }
  ]
}
```
Returns the EonTyre order: `{ orderId, ...orderDetails }`.

> Triggered automatically by the Qliro callback once payment is confirmed —
> the front-end never calls `/api/orders` directly.

---

## 3. Shopping cart — client-only

Cart lives in `localStorage` (no server call, no auth). Implemented by
`window.CartManager` from [`lib/cart-manager.js`](lib/cart-manager.js).

```js
// Add a product (price in öre)
window.CartManager.addItem(product, 1);

// Remove
window.CartManager.removeItem(productId, supplierId, locationId);

// Update qty (clamped to stock)
window.CartManager.updateQuantity(productId, supplierId, locationId, qty);

// Read cart
const { items, subtotal } = window.CartManager.getCart();

// Clear (called after a successful order)
window.CartManager.clearCart();

// Listen for changes (re-render UI)
window.CartManager.onChange(({ items, subtotal }) => { /* ... */ });
```

### localStorage keys

| Key | Shape |
|-----|-------|
| `dc_shopping_cart` | `{ items: [...], subtotal: 0 }` (subtotal in öre) |
| `dc_customer_profile` | last-used customer details for autofill |

### Item shape inside `items[]`

```js
{
  id: "<productId>",          // primary key
  productId: 101702907,       // numeric — required for EonTyre order POST
  sku: "MPS4-22545R17",
  name: "Michelin Pilot Sport 4 ...",
  price: 124900,              // ÖRE
  quantity: 4,
  supplier_id: 503,
  location_id: 1048,
  image: { webshop_thumb: "..." },
  stock: 32,
  attrs: { /* EU-label / flags from /api/products */ }
}
```

> **Always store `productId` (numeric).** EonTyre rejects orders that use the
> opaque encoded `id` string instead of the numeric `productId`.

---

## 4. Checkout — `POST /api/shipping/query`

When the user fills postal code + city on the checkout form, the front-end
fetches available shipping rates from Fraktjakt.

### Request

```json
POST /api/shipping/query
{
  "postal_code": "25220",
  "city": "Helsingborg",
  "address1": "Testgatan 1",
  "items": [{ "productId": 101702907, "quantity": 4, "price": 124900 }],
  "delivery_option": 1
}
```

`delivery_option`: `0` = Pick up at workshop (skip shipping), `1` = Home delivery.

### Server flow

1. Build XML payload for Fraktjakt's `query_xml` endpoint (see XML format below)
2. `GET https://api.fraktjakt.se/fraktjakt/query_xml?xml={url-encoded-xml}`
3. Parse `<shipping_product>` items from the XML response
4. Capture `<shipment_id>` (needed later for Order API type 1 booking)

### Response

```json
{
  "services": [
    {
      "id": "fraktjakt-143",                  // server prefix + numeric service id
      "name": "DHL Home Delivery",
      "carrier": "DHL Freight",
      "price": 467,                            // SEK rounded
      "delivery_time": "Wednesday 6/5",
      "fraktjaktShipmentId": "11460025"        // pass back during booking
    },
    ...
  ]
}
```

### Fraktjakt query XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<shipment xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <value>4996.00</value>                 <!-- order total in SEK -->
  <shipper_info>1</shipper_info>
  <consignor>
    <id>{FRAKTJAKT_CONSIGNOR_ID}</id>
    <key>{FRAKTJAKT_CONSIGNOR_KEY}</key>
    <currency>SEK</currency>
    <language>en</language>
  </consignor>
  <parcels>
    <parcel>
      <weight>32</weight>                  <!-- kg, computed: items × 8kg -->
      <length>63</length>                  <!-- cm -->
      <width>63</width>
      <height>25</height>
    </parcel>
  </parcels>
  <address_to>
    <street_address_1>Testgatan 1</street_address_1>
    <postal_code>25220</postal_code>
    <city>Helsingborg</city>
    <country_code>SE</country_code>
  </address_to>
</shipment>
```

If Fraktjakt is unreachable, server returns three fallback options
(`postnord`, `dhl`, `bring`) so the form is never blocked.

---

## 5. Purchase — `POST /api/qliro/create-checkout`

Submitting the checkout form calls this. It creates a Qliro checkout session
and returns an iframe HTML snippet to embed inline.

### Request

```json
POST /api/qliro/create-checkout
{
  "customerData": {
    "name": "Asif Khan",
    "email": "user@example.com",
    "phone": "+46...",
    "address1": "Testgatan 1",
    "postal_code": "25220",
    "city": "Helsingborg",
    "type": 2
  },
  "cartItems": [ /* same shape as CartManager item */ ],
  "deliveryOption": 1,
  "shipping": {
    "id": "fraktjakt-143",
    "price": 467,
    "carrier": "DHL Freight",
    "name": "DHL Home Delivery",
    "fraktjaktShipmentId": "11460025"
  }
}
```

### Response

```json
{
  "pendingId": "uuid-v4",
  "qliroOrderId": "qliro-xxx-or-mock-xxx",
  "iframeSnippet": "<iframe src=...> or <div>(mock UI)</div>"
}
```

### Server flow

1. Generate `pendingId` + `callbackToken` (UUID v4)
2. Build Qliro `OrderItems[]` from cart (Qliro wants prices in **SEK**, not öre)
3. Detect mock mode: `QLIRO_API_KEY === 'DACKA'` or missing creds
4. **Real mode**: `POST {QLIRO_API_URL}/checkout/merchantapi/orders` with HMAC-signed body, store iframe snippet from response
5. **Mock mode**: build a fake iframe snippet, set a 3-second `setTimeout` that flips the order to `paid` + creates the EonTyre order + books the Fraktjakt shipment
6. Stash pending order data in `pendingOrders` Map (in-memory, keyed by `pendingId`)

The front-end then:
- Inserts `iframeSnippet` into the page
- Polls `GET /api/qliro/status/:pendingId` every 2s
- When status flips to `paid`, snapshots `cart + customer + shipping` into `confirmedOrder`, calls `CartManager.clearCart()`, and renders the thank-you page

### Polling — `GET /api/qliro/status/:pendingId`

```json
{
  "status": "pending" | "paid" | "failed",
  "orderId": 66553,                          // EonTyre order id, present when paid
  "bookingUrl": "...",
  "shippingLabel": "https://www.fraktjakt.se/...",  // Fraktjakt access link
  "tracking": "https://www.fraktjakt.se/trace/..."
}
```

### Webhook — `POST /api/qliro/callback?token=...`

Qliro pushes payment-status changes here. On `success`:
- Mark `pendingOrder.status = 'paid'`
- Trigger EonTyre order POST + Fraktjakt booking (same code path as mock mode)

---

## 6. EonTyre order creation (server-side, automatic)

Triggered after `qliroPaymentId` is set (either by the Qliro callback or the
mock mode timer).

```js
const eontryeOrder = {
  customer: {
    type: 2,
    name, address1, address2, postal_code, city, country: "SE",
    email, phone, update: true,
  },
  products: cartItems.map(i => ({
    id: i.productId || i.sku,
    quantity: i.quantity,
    location_id: i.location_id,
  })),
  reference: `web-${pendingId}`,
  payment_method: "qliro",
  shipping: { /* selected service */ },
};

const r = await fetch(`${EONTYRE_API_URL}/api/v2/orders`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Api-Key": API_KEY },
  body: JSON.stringify(eontryeOrder),
  signal: AbortSignal.timeout(15000),
});
const data = await r.json();   // { orderId: 66553, ... }
```

The returned `orderId` becomes the `MerchantReference` used as the Fraktjakt
`<reference>EONTYRE-66553</reference>` so admins can reconcile shipments to
EonTyre orders by eye.

---

## 7. Courier booking — Fraktjakt Shipment API

After the EonTyre order is created, the server books a draft shipment with
Fraktjakt.

### Endpoint

```
GET https://api.fraktjakt.se/shipments/shipment_xml?xml={url-encoded-xml}
```

### XML payload (`<CreateShipment>`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CreateShipment>
  <consignor>
    <id>{FRAKTJAKT_CONSIGNOR_ID}</id>
    <key>{FRAKTJAKT_CONSIGNOR_KEY}</key>
    <currency>SEK</currency>
    <language>en</language>
    <encoding>UTF-8</encoding>
    <system_name>Dackcentrum</system_name>
    <module_version>1.0</module_version>
    <api_version>4.10.0</api_version>
  </consignor>
  <reference>EONTYRE-66553</reference>
  <recipient>
    <name_to>Asif Khan</name_to>
    <telephone_to>+46...</telephone_to>
    <email_to>user@example.com</email_to>
  </recipient>
  <address_to>
    <street_address_1>Testgatan 1</street_address_1>
    <postal_code>25220</postal_code>
    <residential>1</residential>
    <country_code>SE</country_code>
    <language>sv</language>
  </address_to>
  <commodities>
    <commodity>
      <name>Michelin Pilot Sport 4 225/45 R17</name>
      <quantity>4</quantity>
      <quantity_units>EA</quantity_units>
      <description>Tyres</description>
      <country_of_manufacture>SE</country_of_manufacture>
      <weight>8</weight>
      <length>63</length>
      <width>63</width>
      <height>25</height>
      <unit_price>1249</unit_price>
      <shipped>1</shipped>
      <in_own_parcel>false</in_own_parcel>
      <article_number>MPS4-22545R17</article_number>
    </commodity>
  </commodities>
</CreateShipment>
```

### Response (XML)

```xml
<result>
  <status>warning</status>
  <shipment_id>11459984</shipment_id>
  <access_code>243cac41...</access_code>
  <access_link>https://www.fraktjakt.se/shipments/show/11459984?access_code=...</access_link>
  <tracking_link>https://www.fraktjakt.se/trace/shipment/...</tracking_link>
  ...
</result>
```

The `access_link` is what we expose to the front-end as the shipping label URL.
Admin opens it in Fraktjakt's web UI to pick a carrier and pay for the label —
unless the consignor account has invoice/credit billing enabled, in which case
labels can be auto-purchased via Order API type 1 instead (see `FRAKTJAKT_BOOKING_MODE=order`).

### Order API type 1 (customer's carrier choice)

```
GET https://api.fraktjakt.se/orders/order_xml?xml={url-encoded-xml}
```

```xml
<OrderSpecification>
  <consignor>...</consignor>
  <shipment_id>11460025</shipment_id>          <!-- from the earlier query_xml -->
  <shipping_product_id>143</shipping_product_id>
  <reference>EONTYRE-66553</reference>
  <recipient>...</recipient>
</OrderSpecification>
```

---

## 8. Thank-you / order confirmation

No additional fetch — the page reads everything from React state captured
just before `clearCart()`.

```js
setConfirmedOrder({
  orderId: status.orderId,                       // from Qliro polling
  bookingUrl: status.bookingUrl,
  trackingUrl: status.tracking,
  labelUrl: status.shippingLabel,
  items: cartSnapshot.items,                     // snapshot before clear
  subtotal: cartSnapshot.subtotal,
  deliveryOption: currentDeliveryOption,
  shipping: selectedShipping,
  customer: customerRef.current,
  placedAt: new Date().toISOString(),
});
window.CartManager.clearCart();
setPaymentStep("success");
```

> **Critical:** snapshot the cart **before** `clearCart()`. If you read
> `cart.items` after clearing, the thank-you page will show "empty cart"
> instead of the order summary.

---

## Data type pitfalls

| Concern | Fix |
|---|---|
| Price units | `/api/products` returns öre. Cart, Qliro and EonTyre stay in öre. Fraktjakt expects SEK — always divide by 100 before sending. |
| Product id | EonTyre rejects `id` (encoded string); always send numeric `productId`. |
| Postal code | Strip whitespace before sending to Fraktjakt: `customerData.postal_code.replace(/\s/g, '')`. |
| Phone format | Fraktjakt is permissive but EonTyre prefers Swedish format. The form accepts any. |
| Mock mode | `QLIRO_API_KEY === 'DACKA'` triggers the test path. Replace with real key for production. |

---

## Quick reference — full server route table

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/products` | Tyre search by `plate` / `dimension` / `width+ratio+diameter` |
| GET | `/api/brands` | Brand list for filters |
| POST | `/api/vehicle` | Look up car by licence plate |
| POST | `/api/orders` | Create EonTyre order (server-internal) |
| GET | `/api/orders?id=...` | Fetch order detail |
| POST | `/api/bookings` | Service appointment booking (workshop) |
| GET | `/api/bookings` | List bookings |
| POST | `/api/qliro/create-checkout` | Start payment session |
| GET | `/api/qliro/status/:pendingId` | Poll payment status |
| POST | `/api/qliro/callback` | Qliro server-to-server webhook |
| POST | `/api/shipping/query` | Fraktjakt shipping rates |
| GET | `/api/qliro/test` | Debug: print Qliro env config |
| GET | `/health` | Liveness probe |

---

## Files map

```
server.js                    All routes, EonTyre/Qliro/Fraktjakt integration
lib/cart-manager.js          Browser cart (localStorage)
lib/init-lang.js             SV/EN language switcher
lib/topbar-scroll.js         Hide top bar on scroll-down

api/products.js              Vercel-style serverless variant of /api/products
api/orders.js                Vercel-style /api/orders
api/brands.js                Vercel-style /api/brands
api/vehicle.js               Vercel-style /api/vehicle
api/shipping/query.js        Vercel-style /api/shipping/query

pages/ShopPage.jsx           Shop page with filters + product grid
pages/CheckoutPage.jsx       3-step checkout (form → payment iframe → success)
pages/OrderConfirmationPage.jsx Thank-you page

components/product-card.jsx  Tyre card with EU labels, DOT, XL flag, etc.
components/checkout-form.jsx Customer form + delivery option toggle
components/cart-drawer.jsx   Slide-out cart
components/mini-cart.jsx     Header cart icon + counter

.env.example                 All required env vars with descriptions
```
