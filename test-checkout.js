/**
 * Test checkout flow
 * Simulates adding a product to cart and submitting an order
 */

// Mock CartManager like it would be in the browser
// Using real product IDs from EonTyre API
const mockCart = {
  items: [
    {
      id: "eNwaEUgx_AwLxlNGkBpw7NRrPKsb", // Real BEARWAY product from API
      name: "BEARWAY BW366 205/55-16 91V",
      price: 57920,
      quantity: 1,
      supplier_id: "1048", // From includeLocations parameter
      location_id: "1048",
      image: { original: "https://api.eontyre.com/images/2460103/original.jpg" }
    }
  ],
  subtotal: 57920
};

// Simulate prepareOrder
function prepareOrder(customerData, deliveryOption) {
  return {
    customer: {
      type: customerData.type || 2,
      name: customerData.name,
      address1: customerData.address1 || '',
      address2: customerData.address2 || '',
      postal_code: customerData.postal_code || '',
      city: customerData.city || '',
      country: customerData.country || 'SE',
      email: customerData.email || '',
      phone: customerData.phone,
      id_number: customerData.id_number || undefined,
      update: customerData.update !== false
    },
    products: mockCart.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      supplier: item.supplier_id,
      location: item.location_id
    })),
    delivery_option: deliveryOption
  };
}

// Test data
const testCustomerData = {
  type: 2,
  name: "Test Customer",
  email: "test@example.com",
  phone: "+46701234567",
  address1: "Testgatan 1",
  address2: "",
  postal_code: "25220",
  city: "Helsingborg",
  update: true
};

console.log("📝 Preparing order with test data...");
const orderData = prepareOrder(testCustomerData, 0);
console.log("✅ Order prepared:", JSON.stringify(orderData, null, 2));

console.log("\n🌐 Posting to /api/orders...");
const payload = JSON.stringify(orderData);
console.log("📤 Payload size:", payload.length, "bytes");
console.log("📤 First 200 chars:", payload.substring(0, 200));

// Make the actual request
fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: payload
})
  .then(response => {
    console.log("📬 Response status:", response.status);
    console.log("📬 Response headers:", Object.fromEntries(response.headers));
    return response.json();
  })
  .then(data => {
    console.log("📬 Response data:", JSON.stringify(data, null, 2));
    if (data.response?.err) {
      console.error("❌ Error from API:", data.response.err);
    } else if (data.data?.id) {
      console.log("✅ Order created! ID:", data.data.id);
    } else {
      console.log("⚠️ Unexpected response format");
    }
  })
  .catch(error => {
    console.error("❌ Fetch error:", error.message);
  });
