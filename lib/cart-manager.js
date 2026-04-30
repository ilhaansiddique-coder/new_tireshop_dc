/**
 * Cart Management System
 * Handles shopping cart state, localStorage persistence, and cart operations
 */

console.log('🔧 CartManager loading...');

const CART_STORAGE_KEY = 'dc_shopping_cart';
const CUSTOMER_STORAGE_KEY = 'dc_customer_profile';
const DEFAULT_DELIVERY_OPTION = 0; // 0 = Pick up at garage, 1 = Ship, 2 = Direct delivery

class CartManager {
  constructor() {
    this.cart = this.loadCart();
    this.customer = this.loadCustomer();
    this.listeners = [];
  }

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  loadCart() {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : { items: [], subtotal: 0 };
    } catch (e) {
      console.warn('Failed to load cart:', e);
      return { items: [], subtotal: 0 };
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
      this.notifyListeners();
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  }

  addItem(product, quantity = 1) {
    if (!product || !product.productId) {
      throw new Error('Invalid product');
    }

    const existingItem = this.cart.items.find(
      item => item.id === product.productId &&
               item.supplier_id === product.supplier_id &&
               item.location_id === product.location_id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.items.push({
        id: product.productId,
        name: product.name || product.description,
        price: product.price,
        quantity,
        supplier_id: product.supplier_id,
        location_id: product.location_id,
        image: product.image,
        attrs: product.attrs || {}
      });
    }

    this.updateSubtotal();
    this.saveCart();
    return this.cart.items.length;
  }

  removeItem(productId, supplierId, locationId) {
    const index = this.cart.items.findIndex(
      item => item.id === productId &&
               item.supplier_id === supplierId &&
               item.location_id === locationId
    );

    if (index !== -1) {
      this.cart.items.splice(index, 1);
      this.updateSubtotal();
      this.saveCart();
    }
  }

  updateQuantity(productId, supplierId, locationId, quantity) {
    const item = this.cart.items.find(
      item => item.id === productId &&
               item.supplier_id === supplierId &&
               item.location_id === locationId
    );

    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeItem(productId, supplierId, locationId);
      } else {
        this.updateSubtotal();
        this.saveCart();
      }
    }
  }

  clearCart() {
    this.cart = { items: [], subtotal: 0 };
    this.saveCart();
  }

  getCart() {
    return { ...this.cart };
  }

  getCartCount() {
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  updateSubtotal() {
    this.cart.subtotal = this.cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  }

  // ============================================================================
  // CUSTOMER PROFILE
  // ============================================================================

  loadCustomer() {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed to load customer profile:', e);
      return null;
    }
  }

  saveCustomer(customerData) {
    try {
      this.customer = {
        ...customerData,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(this.customer));
      this.notifyListeners();
    } catch (e) {
      console.warn('Failed to save customer profile:', e);
    }
  }

  getCustomer() {
    return this.customer ? { ...this.customer } : null;
  }

  clearCustomer() {
    this.customer = null;
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    this.notifyListeners();
  }

  // ============================================================================
  // ORDER PREPARATION
  // ============================================================================

  /**
   * Prepare order data for API submission
   * Builds complete order object according to EONTYRE API spec
   */
  prepareOrder(customerData, deliveryOption = DEFAULT_DELIVERY_OPTION, additionalData = {}) {
    if (!this.cart.items.length) {
      throw new Error('Cart is empty');
    }

    if (!customerData || !customerData.name || !customerData.phone) {
      throw new Error('Missing required customer data');
    }

    const order = {
      customer: {
        type: customerData.type || 2, // 1 = Business, 2 = Person (default)
        name: customerData.name,
        address1: customerData.address1 || '',
        address2: customerData.address2 || '',
        postal_code: customerData.postal_code || '',
        city: customerData.city || '',
        country: customerData.country || 'SE',
        email: customerData.email || '',
        phone: customerData.phone,
        ...(customerData.id_number && { id_number: customerData.id_number }),
        ...(customerData.customer_number && { customer_number: customerData.customer_number }),
        update: customerData.update !== false
      },

      products: this.cart.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        ...(item.supplier_id && { supplier: item.supplier_id }),
        ...(item.location_id && { location: item.location_id })
      })),

      delivery_option: deliveryOption,

      ...(customerData.car && {
        car: {
          licenseplate: customerData.car.licenseplate,
          ...(customerData.car.mileage && { mileage: customerData.car.mileage })
        }
      }),

      ...(additionalData.delivery && {
        delivery: {
          name: additionalData.delivery.name,
          address1: additionalData.delivery.address1,
          address2: additionalData.delivery.address2,
          postal_code: additionalData.delivery.postal_code,
          city: additionalData.delivery.city,
          country: additionalData.delivery.country || 'SE'
        }
      }),

      ...(additionalData.references && { references: additionalData.references }),
      ...(additionalData.comments && { comments: additionalData.comments }),
      ...(additionalData.internal_note && { internal_note: additionalData.internal_note }),

      // Payment reference (for later payment processing)
      ...(additionalData.external_payment && {
        external_payment: {
          provider: additionalData.external_payment.provider,
          reference: additionalData.external_payment.reference,
          note: additionalData.external_payment.note
        }
      })
    };

    return order;
  }

  // ============================================================================
  // LISTENERS / OBSERVERS
  // ============================================================================

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getCart(), this.getCustomer());
      } catch (e) {
        console.warn('Listener error:', e);
      }
    });
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  isEmpty() {
    return this.cart.items.length === 0;
  }

  getItemCount() {
    return this.cart.items.length;
  }

  getTotalPrice(options = {}) {
    const { inclVat = false, isOre = true } = options;
    const price = isOre ? this.cart.subtotal / 100 : this.cart.subtotal;
    if (inclVat && this.cart.vatPercent) {
      return price * (1 + this.cart.vatPercent / 100);
    }
    return price;
  }

  formatPrice(options = {}) {
    const price = this.getTotalPrice(options);
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }
}

// Create singleton instance
console.log('🔧 Creating CartManager instance...');
const cartManager = new CartManager();

// Make available globally - BOTH as window.CartManager AND as CartManager
if (typeof window !== 'undefined') {
  window.CartManager = cartManager;
  window.cartManager = cartManager;
  // Also make it global for non-module scripts
  globalThis.CartManager = cartManager;
  console.log('✅ CartManager initialized');
  console.log('   - window.CartManager.getCart:', typeof window.CartManager.getCart);
  console.log('   - Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(cartManager)));
} else {
  console.warn('⚠️ window is undefined');
}
