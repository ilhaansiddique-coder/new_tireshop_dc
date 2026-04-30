/**
 * EONTYRE API Testing & Documentation
 * Provides tools to test all API endpoints
 */

import * as API from './api.js';

/**
 * Test suite for all API endpoints
 */
export const APITests = {
  /**
   * Test vehicle lookup by license plate
   */
  async testVehicleByPlate(plate = 'ABC123') {
    console.log(`Testing vehicle lookup for plate: ${plate}`);
    try {
      const vehicle = await API.fetchVehicleByPlate(plate);
      console.log('✓ Vehicle lookup successful:', vehicle);
      return { success: true, data: vehicle };
    } catch (error) {
      console.error('✗ Vehicle lookup failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test product search
   */
  async testProductSearch(query = '195/65R15') {
    console.log(`Testing product search for: ${query}`);
    try {
      const products = await API.fetchProducts({
        query,
        page: 1,
        limit: 10,
        minQuantityInStock: 1
      });
      console.log(`✓ Found ${products.count} products:`, products.products);
      return { success: true, data: products };
    } catch (error) {
      console.error('✗ Product search failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test tyre products listing
   */
  async testTyreProducts() {
    console.log('Testing tyre products export');
    try {
      const tyres = await API.fetchTyresExport({ minQuantityInStock: 1 });
      console.log(`✓ Found ${tyres.length} tyre products`);
      return { success: true, data: tyres };
    } catch (error) {
      console.error('✗ Tyre products fetch failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test rim products listing
   */
  async testRimProducts() {
    console.log('Testing rim products export');
    try {
      const rims = await API.fetchRimProducts({ minQuantityInStock: 1 });
      console.log(`✓ Found ${rims.length} rim products`);
      return { success: true, data: rims };
    } catch (error) {
      console.error('✗ Rim products fetch failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test complete wheel products listing
   */
  async testCompleteWheels() {
    console.log('Testing complete wheel products');
    try {
      const wheels = await API.fetchCompleteWheelProducts({ minQuantityInStock: 1 });
      console.log(`✓ Found ${wheels.length} complete wheel products`);
      return { success: true, data: wheels };
    } catch (error) {
      console.error('✗ Complete wheels fetch failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test brands listing
   */
  async testBrands() {
    console.log('Testing brands listing');
    try {
      const brands = await API.fetchBrands();
      console.log(`✓ Found ${brands.length} brands:`, brands.map(b => b.name));
      return { success: true, data: brands };
    } catch (error) {
      console.error('✗ Brands fetch failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test stock locations
   */
  async testStockLocations() {
    console.log('Testing stock locations');
    try {
      const locations = await API.fetchStockLocations();
      console.log(`✓ Found ${locations.length} stock locations:`, locations);
      return { success: true, data: locations };
    } catch (error) {
      console.error('✗ Stock locations fetch failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test garages/service locations
   */
  async testGarages() {
    console.log('Testing garages');
    try {
      const garages = await API.fetchGarages();
      console.log(`✓ Found ${garages.length} garages:`, garages);
      return { success: true, data: garages };
    } catch (error) {
      console.error('✗ Garages fetch failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test price export
   */
  async testPrices() {
    console.log('Testing price export');
    try {
      const prices = await API.fetchPrices();
      console.log(`✓ Found ${prices.length} price entries`);
      return { success: true, data: prices };
    } catch (error) {
      console.error('✗ Price export failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test extra products
   */
  async testExtraProducts() {
    console.log('Testing extra products');
    try {
      const extras = await API.fetchExtraProducts();
      console.log(`✓ Found ${extras.length} extra products:`, extras.map(p => p.name));
      return { success: true, data: extras };
    } catch (error) {
      console.error('✗ Extra products fetch failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Run all tests
   */
  async runAll() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('EONTYRE API Test Suite');
    console.log('═══════════════════════════════════════════════════\n');

    const results = {
      vehicle: await this.testVehicleByPlate('ABC123'),
      products: await this.testProductSearch(),
      tyres: await this.testTyreProducts(),
      rims: await this.testRimProducts(),
      wheels: await this.testCompleteWheels(),
      brands: await this.testBrands(),
      locations: await this.testStockLocations(),
      garages: await this.testGarages(),
      prices: await this.testPrices(),
      extras: await this.testExtraProducts()
    };

    const passed = Object.values(results).filter(r => r.success).length;
    const total = Object.values(results).length;

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`Results: ${passed}/${total} tests passed`);
    console.log('═══════════════════════════════════════════════════\n');

    return results;
  }
};

/**
 * API Endpoint Documentation
 */
export const APIDocumentation = {
  endpoints: [
    {
      name: 'Products',
      endpoints: [
        { method: 'GET', path: '/webshop/products', description: 'Search products with filters', params: ['query', 'page', 'limit', 'diameter', 'width', 'aspectRatio', 'typeId', 'minQuantityInStock'] },
        { method: 'GET', path: '/api/webshop/products/:id', description: 'Get single product by ID', params: ['webshop_id', 'customer_id'] },
        { method: 'GET', path: '/api/v2/products/export/tyres', description: 'List tyre products', params: ['webshop_id', 'customer_id', 'minQuantityInStock'] },
        { method: 'GET', path: '/api/v2/products/export/rims', description: 'List rim products', params: ['webshop_id', 'customer_id', 'minQuantityInStock'] },
        { method: 'GET', path: '/api/v2/products/export/complete-wheels', description: 'List complete wheel products', params: ['webshop_id', 'customer_id', 'minQuantityInStock'] },
        { method: 'GET', path: '/webshop/extraproducts', description: 'List extra/service products', params: [] }
      ]
    },
    {
      name: 'Orders',
      endpoints: [
        { method: 'POST', path: '/api/v2/orders', description: 'Create new order', body: 'order data' },
        { method: 'GET', path: '/api/v2/orders/:id', description: 'Get order by ID', params: ['id'] },
        { method: 'GET', path: '/api/webshop/orders', description: 'List orders for customer', params: ['customer_id', 'page', 'limit', 'query', 'delivered'] }
      ]
    },
    {
      name: 'Stock',
      endpoints: [
        { method: 'GET', path: '/api/v2/stock/export', description: 'Get stock export', params: ['webshop'] },
        { method: 'GET', path: '/api/stock/locations', description: 'Get warehouse locations', params: [] },
        { method: 'GET', path: '/api/stock/positions', description: 'Get stock positions for location', params: ['location'] },
        { method: 'GET', path: '/api/stock/positions/:id', description: 'Get single stock position', params: ['id'] }
      ]
    },
    {
      name: 'Vehicles',
      endpoints: [
        { method: 'POST', path: '/api/webshop/cars/:platenumber', description: 'Look up vehicle by license plate', params: ['platenumber'] }
      ]
    },
    {
      name: 'Garages',
      endpoints: [
        { method: 'GET', path: '/webshop/garages', description: 'Get garage/service locations', params: ['version', 'postalCode'] }
      ]
    },
    {
      name: 'Tyre Hotels',
      endpoints: [
        { method: 'GET', path: '/api/car/:licenseplate/tyrehotels', description: 'Get tyre hotels for vehicle', params: ['licenseplate'] },
        { method: 'GET', path: '/api/tyrehotels/:id', description: 'Get tyre hotel details', params: ['id'] },
        { method: 'POST', path: '/api/tyrehotels/:hotel_id/wheels', description: 'Add tyre to hotel', body: 'tyre data' },
        { method: 'POST', path: '/api/tyrehotels/:hotel_id/wheels/:wheel_id', description: 'Update tyre in hotel', body: 'tyre data' }
      ]
    },
    {
      name: 'Prices & Invoices',
      endpoints: [
        { method: 'GET', path: '/api/v2/prices/export', description: 'Get price list', params: ['since', 'customerId', 'productId', 'supplierIds'] },
        { method: 'GET', path: '/api/v2/invoices/:id', description: 'Get invoice info', params: ['id'] },
        { method: 'GET', path: '/api/v2/invoices/:id/pdf', description: 'Download invoice PDF', params: ['id'] }
      ]
    }
  ],

  print() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║         EONTYRE API Endpoints Documentation            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    this.endpoints.forEach(section => {
      console.log(`📦 ${section.name}`);
      console.log('─'.repeat(50));
      section.endpoints.forEach(endpoint => {
        console.log(`  ${endpoint.method.padEnd(6)} ${endpoint.path}`);
        console.log(`    → ${endpoint.description}`);
        if (endpoint.params?.length) {
          console.log(`    ├ Params: ${endpoint.params.join(', ')}`);
        }
        if (endpoint.body) {
          console.log(`    └ Body: ${endpoint.body}`);
        }
      });
      console.log();
    });
  }
};

// Export for console access
window.APITests = APITests;
window.APIDocumentation = APIDocumentation;
