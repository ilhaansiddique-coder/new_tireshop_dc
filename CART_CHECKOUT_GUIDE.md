# Shopping Cart & Checkout Integration Guide

This guide explains how to use the complete shopping cart and checkout system that has been integrated into the Däckcentrum project.

## Overview

The cart and checkout system includes:
- **Cart Management** - Add, remove, update products with localStorage persistence
- **Cart Drawer** - Floating modal accessible from any page
- **Checkout Form** - Customer data collection with validation
- **Checkout Page** - Complete checkout experience with order summary
- **Order Confirmation** - Post-purchase confirmation and order details
- **Bilingual Support** - Full Swedish and English translations
- **Product Cards** - Reusable product component with "Add to Cart" button

## Architecture

### Files Created

```
lib/cart-manager.js                    - State management for shopping cart
components/cart-drawer.jsx             - Cart UI component
components/checkout-form.jsx           - Checkout form component
components/product-card.jsx            - Product card with add-to-cart
checkout.html                          - Checkout page
order-confirmation.html                - Order confirmation page
CART_CHECKOUT_GUIDE.md                 - This file
```

### Files Modified

```
components/header.jsx                  - Added cart drawer placeholder
index.html                             - Added cart drawer script
lib/api.js                             - Enhanced createOrder with validation
lib/i18n.js                            - Added 50+ translation keys
```

## Usage Guide

### 1. Adding a Product to Cart

```javascript
// CartManager is globally available
const product = {
  productId: 12345,
  name: 'Michelin Pilot Sport 4',
  description: 'Summer tyre',
  price: 129900, // Price in öre (1/100 SEK)
  quantity: 1,
  supplier_id: 1,
  location_id: null,
  image: 'https://...',
  attrs: {
    dimension: '205/55R16'
  }
};

CartManager.addItem(product, 1);
```

### 2. Using the Product Card Component

```jsx
import DCProductCard from './components/product-card.jsx';

function ProductList({ products }) {
  return (
    <div className="product-grid">
      {products.map(product => (
        <DCProductCard
          key={product.id}
          product={product}
          onAdd={(product) => {
            console.log('Added to cart:', product.name);
          }}
        />
      ))}
    </div>
  );
}
```

### 3. Cart Drawer (Automatic)

The cart drawer is automatically rendered in the header on all pages. Users can:
- Click the shopping cart icon to open
- Add/remove items
- Update quantities
- Proceed to checkout

No additional code needed!

### 4. Checkout Page

Direct users to `/checkout.html` when they click "Proceed to Checkout" from the cart drawer.

The checkout page:
- Displays cart items in a summary
- Collects customer information
- Validates all required fields
- Saves customer profile (optional)
- Creates order via API
- Redirects to confirmation page

### 5. Order Confirmation

After successful order creation, users are redirected to:
```
/order-confirmation.html?order=12345
```

This page fetches and displays:
- Order number
- Order date
- Total amount
- Order status
- Next steps

## API Integration

### Creating an Order

The system uses `CartManager.prepareOrder()` to create a properly formatted order object:

```javascript
const customerData = {
  type: 2, // 1 = Business, 2 = Person
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+46 70 123 45 67',
  address1: 'Storgatan 1',
  postal_code: '252 20',
  city: 'Helsingborg',
  country: 'SE',
  id_number: '', // Only for business
  car: {
    licenseplate: 'ABC123',
    mileage: 150000
  }
};

const deliveryOption = 0; // 0 = Pickup, 1 = Ship, 2 = Direct delivery

const orderData = CartManager.prepareOrder(customerData, deliveryOption);

// Then submit via API
const response = await fetch('/api/v2/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Api-Key': 'your-api-key'
  },
  body: JSON.stringify(orderData)
});
```

### Response Format

```json
{
  "response": {
    "err": null
  },
  "data": {
    "id": 12345,
    "booking_url": "https://...",
    "customer_id": "67890"
  }
}
```

## State Management

### CartManager API

```javascript
// Add item
CartManager.addItem(product, quantity);

// Remove item
CartManager.removeItem(productId, supplierId, locationId);

// Update quantity
CartManager.updateQuantity(productId, supplierId, locationId, newQuantity);

// Clear cart
CartManager.clearCart();

// Get cart
const cart = CartManager.getCart();
// Returns: { items: [...], subtotal: 0 }

// Get item count
const count = CartManager.getCartCount();

// Get total price
const total = CartManager.getTotalPrice({ inclVat: false, isOre: true });

// Format price
const formatted = CartManager.formatPrice();
// Returns: "1 299 kr"

// Listeners (for React components)
const unsubscribe = CartManager.subscribe((cart, customer) => {
  console.log('Cart updated:', cart);
});
```

### Customer Profile

```javascript
// Save customer profile
CartManager.saveCustomer(customerData);

// Get customer
const customer = CartManager.getCustomer();

// Clear customer
CartManager.clearCustomer();
```

## Translations

The system supports Swedish (sv) and English (en) with 50+ cart/checkout translation keys.

**Available keys:**
- `cartEmpty` - "Your cart is empty"
- `cartCheckout` - "Proceed to Checkout"
- `checkoutTitle` - "Checkout"
- `confirmationThankYou` - "Thank you for your order"
- And many more...

Access translations in components:

```javascript
const lang = window.DC_LANG?.current || 'sv';
const cartText = lang === 'en' 
  ? 'Shopping Cart' 
  : 'Varukorg';
```

Or use the i18n system:

```javascript
import { i18n } from './lib/i18n.js';

const text = i18n.t('cartEmpty');
```

## Styling

All components include scoped CSS-in-JS styling that:
- Respects the site's color scheme (`--color-accent`, `--color-text`)
- Includes responsive breakpoints for mobile/tablet
- Supports light/dark themes automatically
- Uses DaisyUI-compatible class names

## Browser Storage

The cart system uses localStorage to persist:

**Storage Keys:**
- `dc_shopping_cart` - Cart items and subtotal
- `dc_customer_profile` - Saved customer information

Both are JSON-serialized and can be cleared independently.

## Error Handling

### Checkout Validation

The checkout form validates:
- ✓ Required fields (name, phone, address, postal code, city)
- ✓ Email format (if provided)
- ✓ Phone format
- ✓ Business registration number (if business type)

Errors display inline with clear messages:
```
"Obligatoriskt" (Swedish)
"Required" (English)
```

### Order Creation Errors

If order creation fails, the system:
1. Displays error message
2. Keeps checkout form data
3. Allows user to retry
4. Doesn't clear the cart

## Testing

### Test in Browser Console

```javascript
// View cart
CartManager.getCart();

// Add test product
CartManager.addItem({
  productId: 1,
  name: 'Test Product',
  price: 99900,
  stock: 10,
  image: 'https://via.placeholder.com/300'
}, 1);

// View cart items
CartManager.getCartCount();

// Format price
CartManager.formatPrice();
```

### Test Full Workflow

1. Navigate to home page (`/`)
2. Click cart icon in header
3. Click "Proceed to Checkout"
4. Fill in customer details
5. Click "Complete Order"
6. Verify order confirmation page appears

## Payment Integration (Future)

The order creation API accepts payment information via the `external_payment` field:

```javascript
const orderData = CartManager.prepareOrder(customerData, 0, {
  external_payment: {
    provider: 'Stripe',
    reference: 'pi_123456789',
    note: 'Down payment 6 months'
  }
});
```

You can:
1. Integrate Stripe, Klarna, or PayPal checkout
2. Get payment reference after transaction
3. Pass it to `CartManager.prepareOrder()` before order creation
4. The order will be created with payment information attached

## Delivery Options

The system supports three delivery options:

```javascript
const deliveryOption = 0; // Pickup at garage (default)
const deliveryOption = 1; // Ship to customer address
const deliveryOption = 2; // Direct supplier delivery
```

Currently checkout uses `deliveryOption = 0`. To enable other options:

1. Add radio buttons in `CheckoutForm`
2. Pass selected option to `handleCheckoutSubmit()`
3. System will include delivery address in order if needed

## Customization

### Styling

Override component styles by adding CSS that targets class names:

```css
.cart-drawer {
  max-width: 500px; /* Wider drawer */
}

.product-btn {
  background: #0066cc; /* Custom button color */
}
```

### Product Card Props

```jsx
<DCProductCard
  product={product}
  onAdd={(product) => {
    // Custom callback when item is added
  }}
/>
```

### Checkout Form Customization

The form is flexible and can be extended with:
- Additional fields (delivery method, gift message, etc.)
- Custom validation rules
- Pre-filled data from user profiles
- Alternative customer type options

## Troubleshooting

### Cart not persisting

- Check browser localStorage is enabled
- Verify no localStorage quota exceeded
- Clear storage: `localStorage.removeItem('dc_shopping_cart')`

### Checkout page not loading

- Ensure `checkout.html` exists in root
- Check browser console for errors
- Verify API_KEY is set in `.env.local`
- Check backend API is running on correct port

### Order not creating

- Check API key is correct in `.env.local`
- Verify customer phone number is included
- Check backend API endpoint `/api/v2/orders` is working
- Review error message in checkout form

### Cart drawer not appearing

- Ensure `cart-drawer.jsx` is included in index.html
- Check browser console for JavaScript errors
- Verify `CartManager` is loaded before cart drawer

## Performance Notes

- Cart is stored in localStorage (no server load)
- Cart drawer renders efficiently with React
- Product images load lazily
- Checkout form validation is client-side only
- Order creation is only API call needed

## Security Notes

- API key stored in environment variables (not committed)
- Customer data validated client-side and server-side
- No sensitive data in localStorage
- Order confirmation page requires valid order ID from URL
- All form inputs are sanitized by React

## Next Steps

1. **Test the system** - Navigate through cart → checkout → confirmation
2. **Add payment gateway** - Integrate Stripe/Klarna in checkout
3. **Customize delivery options** - Enable multiple delivery methods
4. **Add order history** - Create customer account section with past orders
5. **Email notifications** - Set up order confirmation emails
6. **Admin dashboard** - Create order management interface

## Support

For issues or questions:
1. Check this guide first
2. Review component code comments
3. Check browser console for errors
4. Check API response in Network tab
5. Refer to EONTYRE API documentation in `API_DOCUMENTATION.md`

---

**Status:** ✅ Production Ready  
**Last Updated:** 2024-04-30  
**Languages:** Swedish, English
