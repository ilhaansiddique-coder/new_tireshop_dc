# EONTYRE API Documentation

This document provides complete API documentation for the EONTYRE tire management system.

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Orders](#orders)
4. [Stock](#stock)
5. [Vehicles](#vehicles)
6. [Garages](#garages)
7. [Tyre Hotels](#tyre-hotels)
8. [Prices & Invoices](#prices--invoices)
9. [Utility Functions](#utility-functions)
10. [Configuration](#configuration)

---

## Authentication

All endpoints require an API key. The API key should be passed either as:
- HTTP header: `Api-Key: your_api_key`
- URL parameter: `?apiKey=your_api_key`

To obtain an API key, contact EONTYRE support.

### Configuration

API configuration is set in `.env.local`:

```env
BACKEND_API_URL=http://127.0.0.1:4000
REACT_APP_EONTYRE_API_KEY=your_api_key_here
```

---

## Products

### Search Products

Search for products with various filters.

**Endpoint:** `GET /webshop/products?version=2`

**Parameters:**
- `query` (string) - Search term (e.g., "195/65R15", "Michelin")
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 25)
- `diameter` (number) - Rim diameter (e.g., 20)
- `width` (number) - Tyre width (e.g., 235)
- `aspectRatio` (number) - Aspect ratio (e.g., 35)
- `speedIndex` (string) - Speed rating (e.g., "W")
- `typeId` (number) - Product type (1=Tyre, 2=Rim, 28=Complete wheel)
- `isRunflat` (boolean) - Runflat tyres only
- `isElectricVehicle` (boolean) - EV tyres only
- `minQuantityInStock` (number) - Minimum stock quantity (default: 4)

**JavaScript:**
```javascript
const products = await API.fetchProducts({
  query: "195/65R15",
  diameter: 15,
  width: 195,
  page: 1,
  limit: 25
});
```

**Response:**
```json
{
  "response": { "err": null },
  "data": {
    "products": [
      {
        "id": "product_1:supplier_1",
        "productId": 12345,
        "type": { "id": 1, "name": "Tyre" },
        "brand": { "id": 1, "name": "Michelin" },
        "model": { "id": 2, "name": "Pilot Sport" },
        "name": "Michelin Pilot Sport 195/65R15 91V",
        "price": 89900,
        "vat": 22000,
        "vatPercent": 25,
        "stock": 12,
        "image": "https://...",
        "attrs": {
          "width": 195,
          "diameter": 15,
          "aspectRatio": 65
        }
      }
    ]
  }
}
```

### Get Single Product

Get details for a specific product.

**Endpoint:** `GET /api/webshop/products/:id`

**Parameters:**
- `id` (string) - Product instance ID (format: `product_id:supplier_id:location_id`)
- `webshop_id` (optional) - Webshop ID for custom pricing
- `customer_id` (optional) - Customer ID for custom pricing

**JavaScript:**
```javascript
const product = await API.fetchProduct("12345:supplier_1:location_1");
```

### List Tyre Products

Get all tyre products available.

**Endpoint:** `GET /api/v2/products/export/tyres`

**Parameters:**
- `webshop_id` (optional) - Filter by webshop
- `customer_id` (optional) - Load custom pricing
- `minQuantityInStock` (optional) - Minimum stock quantity (default: 1)

**JavaScript:**
```javascript
const tyres = await API.fetchTyresExport({
  minQuantityInStock: 1
});
```

### List Rim Products

Get all rim products available.

**Endpoint:** `GET /api/v2/products/export/rims`

**JavaScript:**
```javascript
const rims = await API.fetchRimProducts({
  minQuantityInStock: 1
});
```

### List Complete Wheel Products

Get all complete wheel (tyre + rim) products.

**Endpoint:** `GET /api/v2/products/export/complete-wheels`

**JavaScript:**
```javascript
const wheels = await API.fetchCompleteWheelProducts({
  minQuantityInStock: 1
});
```

### List Extra Products

Get service and accessory products.

**Endpoint:** `GET /webshop/extraproducts`

**JavaScript:**
```javascript
const extras = await API.fetchExtraProducts();
```

### Get Brands

Get all available brands.

**Endpoint:** `GET /webshop/brands`

**JavaScript:**
```javascript
const brands = await API.fetchBrands();
```

**Response:**
```json
{
  "response": { "err": null },
  "data": [
    { "id": 1, "name": "Michelin" },
    { "id": 2, "name": "Bridgestone" },
    ...
  ]
}
```

---

## Orders

### Create Order

Create a new order.

**Endpoint:** `POST /api/v2/orders`

**Request Body:**
```javascript
{
  "webshop_id": 123,
  "customer": {
    "id": null,  // Leave null to create new customer
    "type": 2,   // 1 = Business, 2 = Person
    "name": "John Doe",
    "address1": "123 Main St",
    "postal_code": "12345",
    "city": "Helsingborg",
    "country": "SE",
    "phone": "0421608839",
    "email": "john@example.com"
  },
  "products": [
    {
      "id": 12345,
      "quantity": 2,
      "supplier": 1
    }
  ],
  "delivery_option": 0  // 0 = Pick up, 1 = Ship, 2 = Direct
}
```

**JavaScript:**
```javascript
const order = await API.createOrder({
  customer: { ... },
  products: [ ... ]
});
```

### Get Order

Get order details.

**Endpoint:** `GET /api/v2/orders/:id`

**JavaScript:**
```javascript
const order = await API.fetchOrder(123);
```

### List Orders

List orders for a customer.

**Endpoint:** `GET /api/webshop/orders`

**Parameters:**
- `customer_id` (number) - Customer ID
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 100)
- `query` (string) - Smart search (order no., registration, date, etc.)
- `delivered` (number) - 1=Delivered, 2=Not delivered

**JavaScript:**
```javascript
const orders = await API.listOrders({
  customerId: 123,
  page: 1,
  limit: 50
});
```

---

## Stock

### Get Stock Export

Get stock availability for all products.

**Endpoint:** `GET /api/v2/stock/export`

**JavaScript:**
```javascript
const stock = await API.fetchStockExport();
```

**Response:**
```json
{
  "data": [
    {
      "product_id": 12345,
      "stock": 5,
      "supplier_id": null  // null = local stock, number = supplier
    }
  ]
}
```

### Get Stock Locations

Get warehouse/stock locations.

**Endpoint:** `GET /api/stock/locations`

**JavaScript:**
```javascript
const locations = await API.fetchStockLocations();
```

### Get Stock Positions

Get shelves/positions in a location.

**Endpoint:** `GET /api/stock/positions`

**Parameters:**
- `location` (number) - Location ID

**JavaScript:**
```javascript
const positions = await API.fetchStockPositions(1);
```

---

## Vehicles

### Look Up Vehicle by License Plate

Get vehicle details including tire/rim specifications.

**Endpoint:** `POST /api/webshop/cars/:platenumber`

**JavaScript:**
```javascript
const vehicle = await API.fetchVehicleByPlate("ABC123");
```

**Response:**
```json
{
  "data": [
    {
      "brand": { "id": 1, "name": "Volkswagen" },
      "model": { "id": 2, "name": "Golf" },
      "year": "2022",
      "rimBoltPattern": "5x112",
      "tyreSizes": [
        { "width": 205, "aspectRatio": 55, "diameter": 16 }
      ],
      "rimSizes": [
        { "width": 7, "diameter": 16 }
      ]
    }
  ]
}
```

---

## Garages

### Get Garages

Get service locations/garages.

**Endpoint:** `GET /webshop/garages?version=2`

**Parameters:**
- `postalCode` (number) - Filter by postal code

**JavaScript:**
```javascript
const garages = await API.fetchGarages();
```

**Response:**
```json
{
  "data": {
    "garages": [
      {
        "id": 1,
        "name": "Däckcentrum Helsingborg",
        "distance": { "value": 2.3, "unit": "km" }
      }
    ]
  }
}
```

---

## Tyre Hotels

### Get Tyre Hotels for Vehicle

Get tyre hotel services for a specific vehicle.

**Endpoint:** `GET /api/car/:licenseplate/tyrehotels`

**JavaScript:**
```javascript
const hotels = await API.fetchTyrehotelsByPlate("ABC123");
```

### Get Tyre Hotel Details

Get details about a specific tyre hotel.

**Endpoint:** `GET /api/tyrehotels/:id`

**JavaScript:**
```javascript
const hotel = await API.fetchTyrehotelDetail(1);
```

**Response:**
```json
{
  "data": {
    "in_stock": "summer",
    "summer": [
      {
        "id": "wheel_123",
        "brand": "Michelin",
        "model": "Pilot Sport",
        "dimension": "205/55R16",
        "tread_depth": 7.5,
        "dot": "2123",
        "season": "summer"
      }
    ],
    "winter": [],
    "customer": { "id": 1, "name": "John Doe" },
    "car": { "id": 1, "licenseplate": "ABC123" }
  }
}
```

### Add Tyre to Hotel

Add a tyre to tyre hotel storage.

**Endpoint:** `POST /api/tyrehotels/:hotel_id/wheels`

**Request Body:**
```javascript
{
  "brand": "Michelin",
  "model": "Pilot Sport",
  "dimension": "205/55R16",
  "tread_depth": 7.5,
  "dot": "2123",
  "pressure": 32,
  "season": "summer",
  "rim_type": "aluminium",
  "rim_brand": "OZ Racing",
  "placement": "LF"  // LF, RF, LR, RR
}
```

**JavaScript:**
```javascript
const result = await API.addTyreToHotel(hotelId, {
  brand: "Michelin",
  ...
});
```

### Update Tyre in Hotel

Update tyre information.

**Endpoint:** `POST /api/tyrehotels/:hotel_id/wheels/:wheel_id`

**JavaScript:**
```javascript
const result = await API.updateTyreInHotel(hotelId, wheelId, {
  tread_depth: 6.5,
  ...
});
```

---

## Prices & Invoices

### Get Prices

Get product pricing.

**Endpoint:** `GET /api/v2/prices/export`

**Parameters:**
- `since` (string) - Get changes after this timestamp
- `customerId` (string) - Get customer-specific pricing
- `productId` (number) - Get price for single product
- `supplierIds` (number[]) - Filter by suppliers

**JavaScript:**
```javascript
const prices = await API.fetchPrices({
  customerId: 123
});
```

**Response:**
```json
{
  "data": [
    {
      "product_id": 12345,
      "price": 89900,  // in öre (1/100 SEK)
      "supplier_id": 1
    }
  ]
}
```

### Get Invoice

Get invoice information.

**Endpoint:** `GET /api/v2/invoices/:id`

**JavaScript:**
```javascript
const invoice = await API.fetchInvoice(456);
```

### Get Invoice PDF

Get invoice as PDF.

**Endpoint:** `GET /api/v2/invoices/:id/pdf`

**JavaScript:**
```javascript
const pdfUrl = API.fetchInvoicePdf(456);
// Use in <a href={pdfUrl}>Download PDF</a>
```

---

## Utility Functions

### Parse Tyre Dimension

Parse tyre size string (e.g., "205/55R16").

```javascript
const dim = API.parseDimension("205/55R16");
// Returns: { width: 205, aspectRatio: 55, diameter: 16 }
```

### Format Price

Format price for display (converts öre to SEK).

```javascript
const price = API.formatPrice(89900);  // "899 kr"
const priceWithVat = API.formatPrice(89900 + 22000);
```

### Convert Öre to SEK

Convert öre (1/100 SEK) to SEK number.

```javascript
const sek = API.oreToSek(89900);  // 899
```

### Get Season Label

Get human-readable season label.

```javascript
const label = API.seasonLabel(1);  // "Sommardäck"
```

### Get Badge Class

Get DaisyUI badge class for season.

```javascript
const badgeClass = API.seasonBadgeClass(3);  // "badge-warning" (winter)
```

### Build Image URL

Build EONTYRE image URL from image object.

```javascript
const url = API.buildEontyreImageUrl({
  image_id: 12345,
  filetype: "jpg"
});
// Returns: https://api.eontyre.com/images/12345/big.jpg
```

### Get Product Image

Get best available image from product object.

```javascript
const imageUrl = API.productImageUrl(product);
```

### Normalise Response

Normalise varying API response formats to consistent structure.

```javascript
const normalised = API.normaliseProductsResponse(response);
// Returns: { products: [...], count: N, response: {...} }
```

---

## Configuration

### Environment Variables

Set up `.env.local`:

```env
# Backend API
BACKEND_API_URL=http://127.0.0.1:4000
INTERNAL_API_URL=http://127.0.0.1:4000

# EONTYRE API Key (from support)
REACT_APP_EONTYRE_API_KEY=your_api_key_here

# Default language
REACT_APP_DEFAULT_LANG=sv
```

### Using the API in Components

```javascript
import * as API from '../lib/api.js';

// In React component
const [products, setProducts] = React.useState([]);
const [loading, setLoading] = React.useState(false);

React.useEffect(() => {
  setLoading(true);
  API.fetchProducts({ query: "195/65R15" })
    .then(result => setProducts(result.products))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);
```

---

## Error Handling

All API functions throw errors if the request fails. Always wrap calls in try-catch:

```javascript
try {
  const vehicle = await API.fetchVehicleByPlate("ABC123");
} catch (error) {
  console.error("Failed to fetch vehicle:", error);
  // Handle error...
}
```

---

## Rate Limiting

EONTYRE API may have rate limiting. If you receive a 429 response, wait before retrying.

---

## Support

For API issues, contact EONTYRE support with:
- API Key ID
- Endpoint called
- Request parameters
- Error response
- Timestamp of request

---

**Last updated:** 2024-04-30  
**API Version:** v2  
**Status:** Active
