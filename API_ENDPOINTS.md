# API Endpoints Reference

All endpoints are relative to `/api/`

## Product Search

### GET `/api/products?plate=ABC123`
Search tires by Swedish license plate.

**Query Parameters:**
- `plate` (required) — Swedish license plate (e.g., "ABC 123" or "ABC123")

**Response:**
```json
{
  "car": {
    "make": "string",
    "model": "string",
    "year": number,
    "tireDimension": "string (e.g., 205/55R16)",
    "tireWidth": number,
    "tireAspectRatio": number,
    "tireDiameter": number,
    "tireSeasonType": number (1=summer, 2=winter, 3=all-season)
  },
  "products": [
    {
      "id": number,
      "name": "string",
      "brand": "string",
      "dimension": "string",
      "width": number,
      "aspectRatio": number,
      "diameter": number,
      "seasonType": "string (Summer/Winter/All-Season)",
      "seasonTypeId": number (1/2/3),
      "price": number (öre, divide by 100 for SEK),
      "priceFormatted": "string (e.g., '1 299 kr')",
      "stock": number,
      "image": "string (URL)",
      "supplier_id": string,
      "location_id": string,
      "sku": string
    }
  ],
  "tiresFound": number
}
```

**Error Response:**
```json
{
  "error": "string (error message)"
}
```

---

### GET `/api/products?width=205&ratio=55&diameter=16&type=1&brand=michelin`
Search tires by size parameters (optional alternative to plate search).

**Query Parameters:**
- `width` (required) — Tire width in mm (e.g., 205)
- `ratio` (required) — Aspect ratio (e.g., 55)
- `diameter` (required) — Wheel diameter in inches (e.g., 16)
- `type` (optional) — Season type: 1=summer, 2=winter, 3=all-season
- `brand` (optional) — Brand name or ID

**Response:** Same as plate search above

---

## Vehicle Lookup

### POST `/api/vehicle`
Look up vehicle specifications by license plate.

**Request Body:**
```json
{
  "plate": "ABC123"
}
```

**Response:**
```json
{
  "make": "string",
  "model": "string",
  "year": number,
  "tireDimension": "string",
  "tireWidth": number,
  "tireAspectRatio": number,
  "tireDiameter": number,
  "tireSeasonType": number
}
```

---

## Brands

### GET `/api/brands`
Get list of tire brands.

**Response:**
```json
{
  "brands": [
    {
      "id": string,
      "name": "string",
      "logo": "string (URL)"
    }
  ]
}
```

---

## Orders

### POST `/api/orders`
Create a new order.

**Request Body:**
```json
{
  "customer": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "type": "Privatperson" | "Företag",
    "organisation_number": "string (if Företag)"
  },
  "delivery": {
    "street": "string",
    "apt": "string (optional)",
    "postal_code": "string",
    "city": "string"
  },
  "products": [
    {
      "id": number,
      "quantity": number,
      "price": number,
      "supplier_id": string,
      "location_id": string
    }
  ],
  "delivery_option": 0,
  "car": {
    "plate": "string (optional)",
    "mileage": number (optional)
  },
  "comments": "string (optional)"
}
```

**Response:**
```json
{
  "data": {
    "id": string,
    "status": "string"
  }
}
```

---

### GET `/api/orders?id=ORDER_ID`
Retrieve order details by ID.

**Query Parameters:**
- `id` (required) — Order ID

**Response:**
```json
{
  "data": {
    "id": "string",
    "status": "string",
    "created_at": "ISO 8601 timestamp",
    "total": number,
    // ... other order fields
  }
}
```

---

## Service Bookings

### POST `/api/bookings`
Create a service booking.

**Request Body:**
```json
{
  "name": "string (required)",
  "phone": "string (required)",
  "email": "string (required)",
  "plate": "string (optional)",
  "service": "string (e.g., 'Däckskifte')",
  "date": "YYYY-MM-DD (required)",
  "message": "string (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "message": "Booking created successfully",
  "booking": {
    "id": "uuid",
    "name": "string",
    "phone": "string",
    "email": "string",
    "plate": "string|null",
    "service": "string",
    "date": "YYYY-MM-DD",
    "message": "string",
    "createdAt": "ISO 8601 timestamp",
    "status": "pending"
  }
}
```

---

### GET `/api/bookings`
List all service bookings (admin endpoint).

**Response:**
```json
{
  "count": number,
  "bookings": [
    {
      "id": "uuid",
      "name": "string",
      "phone": "string",
      "email": "string",
      "plate": "string|null",
      "service": "string",
      "date": "YYYY-MM-DD",
      "message": "string",
      "createdAt": "ISO 8601 timestamp",
      "status": "pending"
    }
  ]
}
```

---

## Error Handling

All endpoints return error responses in this format:

```json
{
  "error": "Human-readable error message"
}
```

HTTP Status Codes:
- `200` — Success
- `201` — Created (for POST requests)
- `400` — Bad Request (missing/invalid parameters)
- `405` — Method Not Allowed
- `500` — Server Error

---

## Price Format

All prices from the API are in **öre** (Swedish cents, 1/100 SEK).

To convert to SEK and display:
```javascript
const sek = price / 100;
const formatted = new Intl.NumberFormat('sv-SE', { 
  style: 'currency', 
  currency: 'SEK' 
}).format(sek);
// Result: "1 299 kr"
```

---

## Season Type IDs

- `1` — Summer (Sommar)
- `2` — Winter (Vinter)
- `3` — All-season (Årets rond)

---

## Rate Limiting

EonTyre API has rate limits. Implement caching and retry logic for production use.

Current implementation:
- Product searches are not cached (consider adding Redis caching)
- Orders are not rate-limited by this proxy
- Bookings are stored locally in Vercel KV

---

## CORS

All endpoints have CORS enabled (`Access-Control-Allow-Origin: *`) for browser requests.

---

## Authentication

All Vercel Functions securely proxy the EonTyre API key server-side.  
The browser never sees the API key.

- **EonTyre API Key:** Stored in Vercel environment variables
- **Bookings Auth:** None required (public endpoint, intended for customers)
- **Admin Access:** GET `/api/bookings` is public (consider adding auth in production)
