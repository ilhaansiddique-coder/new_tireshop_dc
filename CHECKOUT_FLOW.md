# Complete EonTyre Checkout Flow Documentation

## Overview
The checkout system integrates with EonTyre's order and booking system.

## Complete Flow

### 1. Product Search
- User enters license plate in hero search
- System calls: `GET /api/products?plate=ABC123`
- EonTyre API returns vehicle info + matching products
- Products are displayed in search results section

### 2. Add to Cart
- User clicks "Lägg i varukorg" on a product
- Product data stored in CartManager:
  ```javascript
  {
    id: product.id,           // EonTyre product ID
    sku: product.sku,         // Product SKU (if available)
    name: product.name,
    price: product.price,     // Price in öre
    quantity: 1,
    supplier_id: product.supplier_id,
    location_id: product.location_id,
    image: product.image
  }
  ```
- Cart count updates in header

### 3. Checkout
- User clicks "Checkout" in cart drawer
- Redirects to: `http://localhost:3000/checkout.html`
- CheckoutPage loads with cart items

### 4. Fill Checkout Form
Required fields:
- Name (Fullständigt namn)
- Phone (Telefonnummer)
- Street Address (Gata och husnummer)
- Postal Code (Postnummer)
- City (Stad)

Optional fields:
- Email
- License Plate (vehicle info)
- Apartment/Apt (address2)

### 5. Form Submission
User clicks "Slutför beställning" button

**Flow:**
1. Form validates all required fields
2. Constructs customer data object
3. Calls `CartManager.prepareOrder(customerData, deliveryOption)`
4. POSTs to `/api/orders` with order data
5. EonTyre creates order and returns:
   ```json
   {
     "err": null,
     "data": {
       "id": 66514,
       "booking_url": "https://booking.eontyre.com/511/r/FC72B3FBBD",
       "customer_id": 6292696
     }
   }
   ```

### 6. Booking Redirect
- System receives booking_url from EonTyre
- Shows success message: "✓ Beställning mottagen!"
- Redirects to booking_url after 2 seconds
- User completes booking on EonTyre's site

## API Endpoints

### GET /api/products
Search for tires by license plate or dimensions

**Query Params:**
- `plate` - Swedish license plate (e.g., ABC123)
- OR `width`, `ratio`, `diameter` - Tire dimensions

**Response:**
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
      "id": "eNwaEUgx_AwLxlNGkBpw7NRrPKsb",
      "sku": "product-sku-123",
      "name": "BEARWAY BW366 205/55-16 91V",
      "brand": "BEARWAY",
      "price": 57920,
      "priceFormatted": "579 kr",
      "stock": 82,
      "supplier_id": "1048",
      "location_id": "1048",
      "image": {...}
    }
  ]
}
```

### POST /api/orders
Create an order in EonTyre

**Request Body:**
```json
{
  "customer": {
    "type": 2,
    "name": "Ilhaan Siddique",
    "email": "email@example.com",
    "phone": "+46701234567",
    "address1": "Testgatan 1",
    "address2": "",
    "postal_code": "25220",
    "city": "Helsingborg",
    "country": "SE",
    "update": true
  },
  "products": [
    {
      "id": "product-sku-or-id",
      "quantity": 1,
      "supplier": "1048",
      "location": "1048"
    }
  ],
  "delivery_option": 0
}
```

**Response:**
```json
{
  "err": null,
  "count": 3,
  "data": {
    "id": 66514,
    "booking_url": "https://booking.eontyre.com/511/r/FC72B3FBBD",
    "customer_id": 6292696
  }
}
```

## Troubleshooting

### Error: "Product does not exist"
- Product ID format may be wrong
- Try using SKU instead of ID
- Verify product exists in EonTyre's inventory for that location

### Form doesn't submit
1. Check console (F12) for validation errors
2. Ensure all required fields are filled
3. Check network tab for API responses

### Cart is empty at checkout
- Products weren't added to cart
- Cart was cleared before checkout
- Refresh page to reload from localStorage

## Testing

### Test Order (No Products)
```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "type": 2,
      "name": "Test User",
      "phone": "+46701234567",
      "address1": "Test gatan 1",
      "postal_code": "25220",
      "city": "Helsingborg",
      "country": "SE"
    },
    "products": [],
    "delivery_option": 0
  }'
```

### Test Search
```bash
curl "http://localhost:3000/api/products?plate=ABC123"
```

## Key Files
- `components/search-results.jsx` - Product search display
- `pages/CheckoutPage.jsx` - Checkout form & submission
- `components/checkout-form.jsx` - Form validation
- `lib/cart-manager.js` - Cart state management
- `server.js` - API proxy to EonTyre
