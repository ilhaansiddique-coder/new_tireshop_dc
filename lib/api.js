/**
 * EONTYRE API Helper Functions
 * Provides a client-side interface for EONTYRE endpoints
 */

const API_BASE = process.env.BACKEND_API_URL || process.env.INTERNAL_API_URL || 'http://127.0.0.1:4000';
const API_KEY = process.env.REACT_APP_EONTYRE_API_KEY || '';

/**
 * Make authenticated request to API
 */
async function apiRequest(endpoint, options = {}) {
  const url = new URL(endpoint, API_BASE);

  // Add API key as header or query param
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (API_KEY) {
    headers['Api-Key'] = API_KEY;
  } else if (options.includeApiKey !== false) {
    url.searchParams.set('apiKey', API_KEY);
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// ============================================================================
// PRODUCTS
// ============================================================================

/**
 * Search for products with filters
 * GET /api/v2/products/export or /webshop/products
 */
export async function fetchProducts(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set('query', params.query);
  if (params.page) searchParams.set('page', params.page);
  if (params.limit) searchParams.set('limit', params.limit);
  if (params.diameter) searchParams.set('diameter', params.diameter);
  if (params.width) searchParams.set('width', params.width);
  if (params.aspectRatio) searchParams.set('aspectRatio', params.aspectRatio);
  if (params.speedIndex) searchParams.set('speedIndex', params.speedIndex);
  if (params.tyreType) searchParams.set('typeId', params.tyreType);
  if (params.isRunflat !== undefined) searchParams.set('isRunflat', params.isRunflat);
  if (params.isElectricVehicle !== undefined) searchParams.set('isElectricVehicle', params.isElectricVehicle);
  if (params.isSilence !== undefined) searchParams.set('isSilence', params.isSilence);
  if (params.minQuantityInStock) searchParams.set('minQuantityInStock', params.minQuantityInStock);
  if (params.webshopId) searchParams.set('webshop_id', params.webshopId);
  if (params.customerId) searchParams.set('customer_id', params.customerId);

  const response = await apiRequest(`/webshop/products?version=2&${searchParams.toString()}`);
  return normaliseProductsResponse(response);
}

/**
 * Get a single product by ID
 * GET /api/webshop/products/:id
 */
export async function fetchProduct(productId, webshopId, customerId) {
  const params = new URLSearchParams();
  if (webshopId) params.set('webshop_id', webshopId);
  if (customerId) params.set('customer_id', customerId);

  const response = await apiRequest(
    `/api/webshop/products/${productId}?${params.toString()}`
  );
  return response.data;
}

/**
 * List complete wheel products
 * GET /api/v2/products/export/complete-wheels
 */
export async function fetchCompleteWheelProducts(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.webshopId) searchParams.set('webshop_id', params.webshopId);
  if (params.customerId) searchParams.set('customer_id', params.customerId);
  if (params.minQuantityInStock) searchParams.set('minQuantityInStock', params.minQuantityInStock);

  const response = await apiRequest(
    `/api/v2/products/export/complete-wheels?${searchParams.toString()}`
  );
  return response.data || [];
}

/**
 * List rim products
 * GET /api/v2/products/export/rims
 */
export async function fetchRimProducts(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.webshopId) searchParams.set('webshop_id', params.webshopId);
  if (params.customerId) searchParams.set('customer_id', params.customerId);
  if (params.minQuantityInStock) searchParams.set('minQuantityInStock', params.minQuantityInStock);

  const response = await apiRequest(
    `/api/v2/products/export/rims?${searchParams.toString()}`
  );
  return response.data || [];
}

/**
 * List tyre products
 * GET /api/v2/products/export/tyres
 */
export async function fetchTyresExport(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.webshopId) searchParams.set('webshop_id', params.webshopId);
  if (params.customerId) searchParams.set('customer_id', params.customerId);
  if (params.minQuantityInStock) searchParams.set('minQuantityInStock', params.minQuantityInStock);

  const response = await apiRequest(
    `/api/v2/products/export/tyres?${searchParams.toString()}`
  );
  return response.data || [];
}

/**
 * List extra/service products
 * GET /webshop/extraproducts
 */
export async function fetchExtraProducts() {
  const response = await apiRequest('/webshop/extraproducts');
  return response.data?.products || [];
}

// ============================================================================
// BRANDS
// ============================================================================

/**
 * Get all brands
 * GET /webshop/brands
 */
export async function fetchBrands() {
  const response = await apiRequest('/webshop/brands');
  return response.data || [];
}

// ============================================================================
// ORDERS
// ============================================================================

/**
 * Create a new order
 * POST /api/v2/orders
 */
export async function createOrder(orderData) {
  const response = await apiRequest('/api/v2/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
  return response.data;
}

/**
 * Get order by ID
 * GET /api/v2/orders/:id
 */
export async function fetchOrder(orderId) {
  const response = await apiRequest(`/api/v2/orders/${orderId}`);
  return response.data;
}

/**
 * List orders for a customer
 * GET /api/webshop/orders
 */
export async function listOrders(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.customerId) searchParams.set('customer_id', params.customerId);
  if (params.page) searchParams.set('page', params.page);
  if (params.limit) searchParams.set('limit', params.limit);
  if (params.query) searchParams.set('query', params.query);
  if (params.delivered !== undefined) searchParams.set('delivered', params.delivered);

  const response = await apiRequest(`/api/webshop/orders?${searchParams.toString()}`);
  return response.data || [];
}

// ============================================================================
// STOCK
// ============================================================================

/**
 * Get stock export/availability
 * GET /api/v2/stock/export
 */
export async function fetchStockExport(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.webshop) searchParams.set('webshop', params.webshop);

  const response = await apiRequest(`/api/v2/stock/export?${searchParams.toString()}`);
  return response.data || [];
}

/**
 * Get warehouse/stock locations
 * GET /api/stock/locations
 */
export async function fetchStockLocations() {
  const response = await apiRequest('/api/stock/locations');
  return response.data || [];
}

/**
 * Get stock position/shelf
 * GET /api/stock/positions/:id
 */
export async function fetchStockPosition(positionId) {
  const response = await apiRequest(`/api/stock/positions/${positionId}`);
  return response.data;
}

/**
 * Get all stock positions for a location
 * GET /api/stock/positions
 */
export async function fetchStockPositions(locationId) {
  const params = new URLSearchParams();
  if (locationId) params.set('location', locationId);

  const response = await apiRequest(`/api/stock/positions?${params.toString()}`);
  return response.data || [];
}

// ============================================================================
// VEHICLES
// ============================================================================

/**
 * Look up vehicle by license plate
 * POST /api/webshop/cars/:platenumber
 */
export async function fetchVehicleByPlate(platenumber) {
  if (!platenumber) throw new Error('License plate is required');

  const cleanPlate = platenumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const response = await apiRequest(`/api/webshop/cars/${cleanPlate}`, {
    method: 'POST'
  });
  return response.data;
}

// ============================================================================
// GARAGES
// ============================================================================

/**
 * Get garages/service locations
 * GET /webshop/garages
 */
export async function fetchGarages(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.version) searchParams.set('version', params.version);
  if (params.postalCode) searchParams.set('postalCode', params.postalCode);

  const response = await apiRequest(`/webshop/garages?version=2&${searchParams.toString()}`);
  return response.data?.garages || [];
}

// ============================================================================
// TYRE HOTELS
// ============================================================================

/**
 * Get tyre hotels for a vehicle
 * GET /api/car/:licenseplate/tyrehotels
 */
export async function fetchTyrehotelsByPlate(licenseplate) {
  if (!licenseplate) throw new Error('License plate is required');

  const cleanPlate = licenseplate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const response = await apiRequest(`/api/car/${cleanPlate}/tyrehotels`);
  return response.data;
}

/**
 * Get tyre hotel details
 * GET /api/tyrehotels/:id
 */
export async function fetchTyrehotelDetail(hotelId) {
  const response = await apiRequest(`/api/tyrehotels/${hotelId}`);
  return response.data;
}

/**
 * Add tyre to hotel
 * POST /api/tyrehotels/:hotel_id/wheels
 */
export async function addTyreToHotel(hotelId, tyreData) {
  const response = await apiRequest(`/api/tyrehotels/${hotelId}/wheels`, {
    method: 'POST',
    body: JSON.stringify(tyreData)
  });
  return response.data;
}

/**
 * Update tyre in hotel
 * POST /api/tyrehotels/:hotel_id/wheels/:wheel_id
 */
export async function updateTyreInHotel(hotelId, wheelId, tyreData) {
  const response = await apiRequest(`/api/tyrehotels/${hotelId}/wheels/${wheelId}`, {
    method: 'POST',
    body: JSON.stringify(tyreData)
  });
  return response.data;
}

// ============================================================================
// PRICES & INVOICES
// ============================================================================

/**
 * Get price list
 * GET /api/v2/prices/export
 */
export async function fetchPrices(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.since) searchParams.set('since', params.since);
  if (params.customerId) searchParams.set('customerId', params.customerId);
  if (params.productId) searchParams.set('productId', params.productId);
  if (params.supplierIds) {
    params.supplierIds.forEach(id => searchParams.append('supplierIds', id));
  }

  const response = await apiRequest(`/api/v2/prices/export?${searchParams.toString()}`);
  return response.data || [];
}

/**
 * Get invoice PDF
 * GET /api/v2/invoices/:id/pdf
 */
export async function fetchInvoicePdf(invoiceId) {
  return `${API_BASE}/api/v2/invoices/${invoiceId}/pdf?Api-Key=${API_KEY}`;
}

/**
 * Get invoice info
 * GET /api/v2/invoices/:id
 */
export async function fetchInvoice(invoiceId) {
  const response = await apiRequest(`/api/v2/invoices/${invoiceId}`);
  return response.data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse tyre dimension string (e.g., "205/55R16")
 */
export function parseDimension(str) {
  const match = str?.match(/(\d+)\/(\d+)R(\d+)/);
  if (!match) return { width: null, aspectRatio: null, diameter: null };

  return {
    width: parseInt(match[1]),
    aspectRatio: parseInt(match[2]),
    diameter: parseInt(match[3])
  };
}

/**
 * Convert öre (1/100 SEK) to SEK number
 */
export function oreToSek(ore) {
  return ore / 100;
}

/**
 * Format price for display
 * öre (API) -> formatted string with currency
 */
export function formatPrice(priceOre, options = {}) {
  const { inclVat = false, isOre = true } = options;
  const priceNum = isOre ? oreToSek(priceOre) : priceOre;

  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(priceNum);
}

/**
 * Get season label from tyre type
 */
export function seasonLabel(tyreType) {
  const labels = {
    1: 'Sommardäck',
    2: 'Helårsdäck',
    3: 'Vinterdäck (Nordisk)',
    4: 'Vinterdäck (Nordisk)',
    5: 'Studded',
    6: 'Studdable',
    7: 'Reservdäck',
    8: 'Tävlingsdäck',
    9: 'Vinterdäck (Europeisk)'
  };
  return labels[tyreType] || 'Okänd';
}

/**
 * Get DaisyUI badge class for season
 */
export function seasonBadgeClass(tyreType) {
  const typeNum = parseInt(tyreType);
  if ([2, 4, 6].includes(typeNum)) return 'badge-warning'; // Winter
  if ([1].includes(typeNum)) return 'badge-info'; // Summer
  if ([2, 3].includes(typeNum)) return 'badge-secondary'; // All-season
  return 'badge-neutral';
}

/**
 * Build EONTYRE image URL
 */
export function buildEontyreImageUrl(imageObj) {
  if (!imageObj) return null;
  if (imageObj.image_id) {
    return `https://api.eontyre.com/images/${imageObj.image_id}/big.${imageObj.filetype}`;
  }
  return null;
}

/**
 * Get best available image from product
 */
export function productImageUrl(product) {
  if (!product) return null;

  // Try different image formats that might be returned
  if (product.image) return product.image;
  if (product.images?.length) return product.images[0];
  if (product.image_id) {
    return buildEontyreImageUrl({
      image_id: product.image_id,
      filetype: product.filetype || 'jpg'
    });
  }

  return null;
}

/**
 * Normalise varying API response formats
 */
export function normaliseProductsResponse(payload) {
  if (!payload) return { products: [], count: 0 };

  // Handle direct data array response
  if (Array.isArray(payload)) {
    return { products: payload, count: payload.length };
  }

  // Handle response with data wrapper
  if (payload.data) {
    const products = Array.isArray(payload.data) ? payload.data : payload.data.products;
    return {
      products: products || [],
      count: payload.count || products?.length || 0,
      response: payload.response
    };
  }

  // Handle response with products field
  if (payload.products) {
    return {
      products: payload.products,
      count: payload.count || payload.products.length,
      response: payload.response
    };
  }

  return { products: [], count: 0 };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // Products
  fetchProducts,
  fetchProduct,
  fetchCompleteWheelProducts,
  fetchRimProducts,
  fetchTyresExport,
  fetchExtraProducts,

  // Brands
  fetchBrands,

  // Orders
  createOrder,
  fetchOrder,
  listOrders,

  // Stock
  fetchStockExport,
  fetchStockLocations,
  fetchStockPosition,
  fetchStockPositions,

  // Vehicles
  fetchVehicleByPlate,

  // Garages
  fetchGarages,

  // Tyre Hotels
  fetchTyrehotelsByPlate,
  fetchTyrehotelDetail,
  addTyreToHotel,
  updateTyreInHotel,

  // Prices & Invoices
  fetchPrices,
  fetchInvoicePdf,
  fetchInvoice,

  // Utilities
  parseDimension,
  oreToSek,
  formatPrice,
  seasonLabel,
  seasonBadgeClass,
  buildEontyreImageUrl,
  productImageUrl,
  normaliseProductsResponse
};
