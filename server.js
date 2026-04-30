const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Constants
const EONTYRE_API_URL = process.env.EONTYRE_API_URL || "https://p511.eontyre.com";
const API_KEY = process.env.EONTYRE_API_KEY || "";
const BOOKINGS_FILE = path.join(__dirname, "bookings.json");

// Qliro Payment Configuration
const QLIRO_API_KEY = process.env.QLIRO_API_KEY || "";
const QLIRO_API_SECRET = process.env.QLIRO_API_SECRET || "";
const QLIRO_API_URL = process.env.QLIRO_API_URL || "https://pago.qit.nu";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Temporary order storage (in-memory)
const pendingOrders = new Map();

// Fraktjakt Shipping Configuration
const FRAKTJAKT_ID = process.env.FRAKTJAKT_CONSIGNOR_ID || "";
const FRAKTJAKT_KEY = process.env.FRAKTJAKT_CONSIGNOR_KEY || "";
const SHOP_ORIGIN_STREET = process.env.SHOP_ORIGIN_STREET || "";
const SHOP_ORIGIN_POSTAL = process.env.SHOP_ORIGIN_POSTAL || "25220";
const SHOP_ORIGIN_CITY = process.env.SHOP_ORIGIN_CITY || "Helsingborg";
const FRAKTJAKT_API_URL = "https://api.fraktjakt.se/fraktjakt";

console.log(`
🚀 Däckcentrum API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: ${NODE_ENV}
Port: ${PORT}
EonTyre API: ${EONTYRE_API_URL}
API Key: ${API_KEY ? "✅ Configured" : "❌ Missing"}
`);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
}));
app.use(compression());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.static("."));

// CORS
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isLocalDev =
        NODE_ENV !== "production" &&
        (/^http:\/\/localhost(:\d+)?$/.test(origin) ||
          /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin));
      const isWhitelisted = allowedOrigins.includes(origin);

      if (isWhitelisted || isLocalDev) return callback(null, true);
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(new Error("CORS policy violation"));
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests" },
});
app.use("/api", limiter);

// ============================================================================
// Bookings Helper
// ============================================================================
function loadBookings() {
  try {
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// ============================================================================
// API Routes
// ============================================================================

// GET /api/products — search tires by plate or size
app.get("/api/products", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "Server missing API_KEY" });
    }

    const { plate, width, ratio, diameter, type, brand } = req.query;

    if (plate) {
      // Plate-based search
      const cleanPlate = plate.replace(/[^A-Z0-9]/g, "").toUpperCase();
      console.log(`[Products] Searching by plate: ${cleanPlate}`);

      try {
        const carUrl = `${EONTYRE_API_URL}/api/webshop/cars/${encodeURIComponent(cleanPlate)}`;
        console.log(`[Products] Calling EonTyre API: ${carUrl}`);

        const carResponse = await fetch(carUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Api-Key": API_KEY
          }
        });

        console.log(`[Products] EonTyre response status: ${carResponse.status}`);

        if (!carResponse.ok) {
          const errorText = await carResponse.text();
          console.log(`[Products] EonTyre error response: ${errorText}`);
          throw new Error(`Car lookup failed: ${carResponse.status} - ${errorText}`);
        }

        const carData = await carResponse.json();
        const car = carData.data;

        if (!car?.tyreStandardSize?.width || !car?.tyreStandardSize?.aspectRatio || !car?.tyreStandardSize?.diameter) {
          return res.status(400).json({ error: "Car tire dimensions not found" });
        }

        const params = new URLSearchParams({
          version: "2",
          width: car.tyreStandardSize.width,
          aspectRatio: car.tyreStandardSize.aspectRatio,
          diameter: car.tyreStandardSize.diameter,
          typeId: type || "1",
          searchMode: "4",
          webshopId: "38",
          limit: "50",
          minQuantityInStock: "1",
          showNoimageTyres: "1",
          showNoimageRims: "1",
          includeLocations: "1048",
          vehicleType: "alla",
          isElectricVehicle: "false",
          isEnforced: "false",
          isMCVehicleType: "false",
          isRunflat: "false",
          isSilence: "false",
          isStaggeredFitment: "true",
          minimumTestScore: "0",
          page: "1"
        });

        if (brand) params.append("query", brand);

        const productsResponse = await fetch(
          `${EONTYRE_API_URL}/api/webshop/products?${params}`,
          { headers: { "Api-Key": API_KEY } }
        );

        const productsData = await productsResponse.json();
        const productsList = productsData.data?.products || [];
        const normalized = normalizeProducts(productsList);

        res.json({
          car: {
            make: car.brand?.name || "Unknown",
            model: car.model?.name || "Unknown",
            year: car.year,
            tireDimension: car.tyreStandardSize.text,
          },
          products: normalized,
          tiresFound: normalized.length,
        });
      } catch (err) {
        console.error("[Products] Error:", err.message);
        res.status(500).json({ error: err.message });
      }
    } else if (width && ratio && diameter) {
      // Direct size search
      const params = new URLSearchParams({
        version: "2",
        width,
        aspectRatio: ratio,
        diameter,
        typeId: type || "1",
        searchMode: "4",
        webshopId: "38",
        limit: "50",
        minQuantityInStock: "1",
        showNoimageTyres: "1",
        showNoimageRims: "1",
        includeLocations: "1048",
        vehicleType: "alla",
        isElectricVehicle: "false",
        isEnforced: "false",
        isMCVehicleType: "false",
        isRunflat: "false",
        isSilence: "false",
        isStaggeredFitment: "true",
        minimumTestScore: "0",
        page: "1"
      });

      if (brand) params.append("query", brand);

      try {
        const productsResponse = await fetch(
          `${EONTYRE_API_URL}/api/webshop/products?${params}`,
          { headers: { "Api-Key": API_KEY } }
        );

        const products = await productsResponse.json();
        const productsList = Array.isArray(products) ? products : (products.data?.products || products.data || []);
        const normalized = normalizeProducts(productsList);

        res.json({ products: normalized, tiresFound: normalized.length });
      } catch (err) {
        console.error("[Products] Error:", err.message);
        res.status(500).json({ error: err.message });
      }
    } else {
      res.status(400).json({ error: "Provide either plate OR (width, ratio, diameter)" });
    }
  } catch (err) {
    console.error("[Products] Unexpected error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/brands — get tire brands
app.get("/api/brands", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "Server missing API_KEY" });
    }

    const response = await fetch(`${EONTYRE_API_URL}/api/webshop/brands`, {
      headers: { "Api-Key": API_KEY },
    });

    const data = await response.json();
    const brands = Array.isArray(data) ? data : data.data || data.brands || [];

    res.json({
      brands: brands.map((b) => ({ id: b.id, name: b.name, logo: b.logo_url || b.logo })),
    });
  } catch (err) {
    console.error("[Brands] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle — lookup car by plate
app.post("/api/vehicle", async (req, res) => {
  try {
    const { plate } = req.body;
    if (!plate) {
      return res.status(400).json({ error: "Plate required" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "Server missing API_KEY" });
    }

    const cleanPlate = plate.replace(/[^A-Z0-9]/g, "").toUpperCase();
    const response = await fetch(`${EONTYRE_API_URL}/api/webshop/cars/${encodeURIComponent(cleanPlate)}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Api-Key": API_KEY
      }
    });

    const carData = await response.json();
    const car = carData.data;

    res.json({
      make: car?.brand?.name || "Unknown",
      model: car?.model?.name || "Unknown",
      year: car?.year,
      tireDimension: car?.tyreStandardSize?.text,
    });
  } catch (err) {
    console.error("[Vehicle] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — create order
app.post("/api/orders", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "Server missing API_KEY" });
    }

    const response = await fetch(`${EONTYRE_API_URL}/api/v2/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": API_KEY,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(201).json(data);
  } catch (err) {
    console.error("[Orders] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — retrieve order
app.get("/api/orders", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Order ID required" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "Server missing API_KEY" });
    }

    const response = await fetch(`${EONTYRE_API_URL}/api/v2/orders/${id}`, {
      headers: { "Api-Key": API_KEY },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("[Orders] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings — create service booking
app.post("/api/bookings", (req, res) => {
  try {
    const { name, phone, email, plate, service, date, message } = req.body;

    if (!name || !phone || !email || !service || !date) {
      return res.status(400).json({
        error: "Missing required fields: name, phone, email, service, date",
      });
    }

    const bookingId = uuidv4();
    const booking = {
      id: bookingId,
      name,
      phone,
      email,
      plate: plate || null,
      service,
      date,
      message: message || "",
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const bookings = loadBookings();
    bookings.push(booking);
    saveBookings(bookings);

    console.log(`[Bookings] Created: ${bookingId}`);

    res.status(201).json({
      id: bookingId,
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    console.error("[Bookings] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings — list all bookings (admin)
app.get("/api/bookings", (req, res) => {
  try {
    const bookings = loadBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("[Bookings] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Qliro Payment Routes
// ============================================================================

// Helper: Generate Basic Auth header
function generateBasicAuth(key, secret) {
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

// POST /api/qliro/create-checkout — Create Qliro checkout session
app.post("/api/qliro/create-checkout", async (req, res) => {
  try {
    const { customerData, cartItems, deliveryOption } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!customerData || !customerData.email) {
      return res.status(400).json({ error: "Customer email required" });
    }

    const pendingId = uuidv4();
    const callbackToken = uuidv4();

    console.log(`[Qliro] Creating checkout for pendingId: ${pendingId}`);

    // Create Qliro order payload
    const qliroOrder = {
      MerchantReference: pendingId,
      MerchantApiKey: QLIRO_API_KEY,
      Country: "SE",
      Currency: "SEK",
      Language: "sv-se",
      MerchantConfirmationUrl: `${BASE_URL}/checkout-success.html`,
      MerchantTermsUrl: `${BASE_URL}/terms.html`,
      MerchantCheckoutStatusPushUrl: `${BASE_URL}/api/qliro/callback?token=${callbackToken}`,
      OrderItems: cartItems.map((item) => ({
        MerchantReference: item.productId.toString(),
        Description: item.name,
        Type: "Product",
        Quantity: item.quantity,
        PricePerItemIncVat: item.price / 100,
        PricePerItemExVat: (item.price / 100) / 1.25,
      })),
      CustomerInformation: { Email: customerData.email },
    };

    console.log(`[Qliro] Order payload:`, JSON.stringify(qliroOrder, null, 2));

    // For local testing: mock Qliro response if credentials are invalid
    let createData, iframeSnippet, qliroOrderId;

    if (NODE_ENV === "development" && QLIRO_API_KEY === "DACKA") {
      console.log(`[Qliro] MOCK MODE - Using test response`);
      qliroOrderId = `mock-qliro-${pendingId.substring(0, 8)}`;
      iframeSnippet = `
        <div style="border: 2px solid #0ea5e9; padding: 20px; border-radius: 8px; background: #f0f9ff; text-align: center;">
          <h3 style="color: #0c4a6e; margin-top: 0;">🧪 Qliro Payment Form (Test Mode)</h3>
          <p style="color: #0c4a6e; margin: 10px 0;">API credentials (DACKA) are in development mode.</p>
          <p style="color: #0c4a6e; font-size: 14px; margin: 10px 0;">In production, Qliro's actual payment form would appear here.</p>
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #cbd5e1;">
            <p style="font-size: 12px; color: #666; margin: 0;">To use real Qliro payments:</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">1. Get valid Qliro API credentials from https://developers.qliro.com</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">2. Update QLIRO_API_KEY and QLIRO_API_SECRET in .env.local</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">3. Restart the server</p>
          </div>
          <p style="color: #10b981; font-weight: bold; margin-top: 15px; font-size: 14px;">✅ Payment will auto-complete in 3 seconds for testing...</p>
        </div>
      `;
      console.log(`[Qliro] Mock OrderId: ${qliroOrderId}`);

      // Auto-complete payment after 3 seconds in test mode
      setTimeout(() => {
        const mockPending = pendingOrders.get(pendingId);
        if (mockPending && mockPending.status === "pending") {
          console.log(`[Qliro] Auto-completing payment for test mode: ${pendingId}`);
          mockPending.status = "paid";
          mockPending.qliroPaymentId = `mock-payment-${uuidv4()}`;

          // Create EonTyre order immediately
          (async () => {
            try {
              const eontryeOrder = {
                customer: {
                  type: mockPending.customerData.type || 2,
                  name: mockPending.customerData.name,
                  address1: mockPending.customerData.address1 || "",
                  address2: mockPending.customerData.address2 || "",
                  postal_code: mockPending.customerData.postal_code || "",
                  city: mockPending.customerData.city || "",
                  country: mockPending.customerData.country || "SE",
                  email: mockPending.customerData.email || "",
                  phone: mockPending.customerData.phone,
                  update: true,
                },
                products: mockPending.cartItems.map((item) => ({
                  id: item.productId || item.sku || item.id,
                  quantity: item.quantity,
                  ...(item.supplier_id && { supplier: item.supplier_id }),
                  ...(item.location_id && { location: item.location_id }),
                })),
                delivery_option: mockPending.deliveryOption || 0,
              };

              const eontryeResponse = await fetch(`${EONTYRE_API_URL}/api/v2/orders`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Api-Key": API_KEY,
                },
                body: JSON.stringify(eontryeOrder),
              });

              const eontryeData = await eontryeResponse.json();
              if (eontryeResponse.ok && !eontryeData.err) {
                mockPending.eontyre = {
                  orderId: eontryeData.data?.id,
                  bookingUrl: eontryeData.data?.booking_url,
                };
                console.log(`[Qliro] Mock payment: EonTyre order created ${eontryeData.data?.id}`);
              }
            } catch (err) {
              console.error(`[Qliro] Mock payment: Error creating EonTyre order`, err.message);
            }
          })();
        }
      }, 3000);
    } else {
      // Real Qliro API call
      const createResponse = await fetch(
        `${QLIRO_API_URL}/checkout/merchantapi/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: generateBasicAuth(QLIRO_API_KEY, QLIRO_API_SECRET),
          },
          body: JSON.stringify(qliroOrder),
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`[Qliro] Create order failed: ${createResponse.status}`);
        console.error(`[Qliro] Response: ${errorText}`);
        throw new Error(`Qliro order creation failed: ${createResponse.status} - ${errorText}`);
      }

      createData = await createResponse.json();
      qliroOrderId = createData.OrderId;
      console.log(`[Qliro] Created order with ID: ${qliroOrderId}`);

      if (!qliroOrderId) {
        throw new Error("No OrderId returned from Qliro");
      }

      // GET the iframe snippet from Qliro
      const snippetResponse = await fetch(
        `${QLIRO_API_URL}/checkout/merchantapi/orders/${qliroOrderId}`,
        {
          method: "GET",
          headers: {
            Authorization: generateBasicAuth(QLIRO_API_KEY, QLIRO_API_SECRET),
          },
        }
      );

      if (!snippetResponse.ok) {
        const errorText = await snippetResponse.text();
        console.error(`[Qliro] Get snippet failed: ${snippetResponse.status} - ${errorText}`);
        throw new Error(`Qliro snippet fetch failed: ${snippetResponse.status}`);
      }

      const snippetData = await snippetResponse.json();
      iframeSnippet = snippetData.Snippet;
      console.log(`[Qliro] Retrieved iframe snippet`);
    }

    // Store pending order
    pendingOrders.set(pendingId, {
      customerData,
      cartItems,
      deliveryOption,
      qliroOrderId,
      callbackToken,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    console.log(`[Qliro] Stored pending order: ${pendingId}`);

    res.json({ pendingId, qliroOrderId, iframeSnippet });
  } catch (err) {
    console.error("[Qliro] Error creating checkout:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/qliro/callback — Qliro payment webhook
app.post("/api/qliro/callback", async (req, res) => {
  try {
    const { token } = req.query;
    const { OrderId, MerchantReference, Status, PaymentTransactionId } = req.body;

    console.log(`[Qliro Callback] Received: ${Status} for ${MerchantReference}`);

    // Validate token
    const pending = pendingOrders.get(MerchantReference);
    if (!pending || pending.callbackToken !== token) {
      console.error(`[Qliro Callback] Invalid token for ${MerchantReference}`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Only process completed payments
    if (Status !== "Completed") {
      console.log(`[Qliro Callback] Status is ${Status}, not processing`);
      pending.status = Status;
      return res.json({ Success: true });
    }

    console.log(`[Qliro Callback] Processing completed payment for ${MerchantReference}`);

    // Create EonTyre order from pending data
    try {
      const eontryeOrder = {
        customer: {
          type: pending.customerData.type || 2,
          name: pending.customerData.name,
          address1: pending.customerData.address1 || "",
          address2: pending.customerData.address2 || "",
          postal_code: pending.customerData.postal_code || "",
          city: pending.customerData.city || "",
          country: pending.customerData.country || "SE",
          email: pending.customerData.email || "",
          phone: pending.customerData.phone,
          update: true,
        },
        products: pending.cartItems.map((item) => ({
          id: item.productId || item.sku || item.id,
          quantity: item.quantity,
          ...(item.supplier_id && { supplier: item.supplier_id }),
          ...(item.location_id && { location: item.location_id }),
        })),
        delivery_option: pending.deliveryOption || 0,
      };

      console.log(`[Qliro Callback] Creating EonTyre order...`);

      const eontryeResponse = await fetch(`${EONTYRE_API_URL}/api/v2/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": API_KEY,
        },
        body: JSON.stringify(eontryeOrder),
      });

      const eontryeData = await eontryeResponse.json();

      if (!eontryeResponse.ok || eontryeData.err) {
        throw new Error(`EonTyre error: ${eontryeData.err || eontryeResponse.status}`);
      }

      console.log(`[Qliro Callback] EonTyre order created: ${eontryeData.data?.id}`);

      // Update pending order with EonTyre response
      pending.status = "paid";
      pending.qliroPaymentId = OrderId;
      pending.eontyre = {
        orderId: eontryeData.data?.id,
        bookingUrl: eontryeData.data?.booking_url,
      };
    } catch (err) {
      console.error(`[Qliro Callback] Failed to create EonTyre order:`, err.message);
      pending.status = "payment_confirmed_eontyre_pending";
    }

    // Always return success to Qliro (we process async)
    res.json({ Success: true });
  } catch (err) {
    console.error("[Qliro Callback] Error:", err.message);
    res.status(500).json({ Success: false, error: err.message });
  }
});

// GET /api/qliro/status/:pendingId — Check payment status
app.get("/api/qliro/status/:pendingId", (req, res) => {
  try {
    const { pendingId } = req.params;
    const pending = pendingOrders.get(pendingId);

    if (!pending) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      status: pending.status,
      bookingUrl: pending.eontyre?.bookingUrl,
      orderId: pending.eontyre?.orderId,
      qliroOrderId: pending.qliroOrderId,
    });
  } catch (err) {
    console.error("[Qliro Status] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Fraktjakt Shipping Routes
// ============================================================================

// POST /api/shipping/query — Query available shipping methods
app.post("/api/shipping/query", async (req, res) => {
  try {
    const { postal_code, city, address1, items } = req.body;

    if (!postal_code || !items || items.length === 0) {
      return res.status(400).json({ error: "postal_code and items required" });
    }

    console.log(`[Fraktjakt] Query for: ${address1}, ${postal_code} ${city}`);

    // Mock mode - return test shipping options
    if (!FRAKTJAKT_ID || !FRAKTJAKT_KEY) {
      console.log(`[Fraktjakt] MOCK MODE - no credentials configured`);
      const mockServices = [
        {
          id: "mock-postnord",
          name: "PostNord Varubrev",
          carrier: "PostNord",
          price: 49,
          currency: "SEK",
          delivery_time: "2-3 dagar",
        },
        {
          id: "mock-dhl",
          name: "DHL Paket",
          carrier: "DHL",
          price: 99,
          currency: "SEK",
          delivery_time: "1-2 dagar",
        },
        {
          id: "mock-schenker",
          name: "Schenker Express",
          carrier: "Schenker",
          price: 149,
          currency: "SEK",
          delivery_time: "Nästa dag",
        },
      ];

      return res.json({ services: mockServices });
    }

    // Real Fraktjakt API call (when credentials are configured)
    console.log(`[Fraktjakt] Querying real API...`);

    // Build Fraktjakt XML payload
    const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 8), 0); // 8kg per tire
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fraktjakt>
  <consignor>
    <id>${FRAKTJAKT_ID}</id>
    <key>${FRAKTJAKT_KEY}</key>
  </consignor>
  <from>
    <address>${SHOP_ORIGIN_STREET}</address>
    <postal_code>${SHOP_ORIGIN_POSTAL}</postal_code>
    <city>${SHOP_ORIGIN_CITY}</city>
    <country>SE</country>
  </from>
  <to>
    <address>${address1}</address>
    <postal_code>${postal_code}</postal_code>
    <city>${city || ""}</city>
    <country>SE</country>
  </to>
  <commodities language="sv" currency="SEK">
    <commodity>
      <description>Pneumatic tires</description>
      <taric_code>40112000</taric_code>
      <weight>${totalWeight}</weight>
      <quantity>${items.length}</quantity>
      <length>63</length>
      <width>25</width>
      <height>25</height>
    </commodity>
  </commodities>
</fraktjakt>`;

    const encodedXml = encodeURIComponent(xml);
    const queryUrl = `${FRAKTJAKT_API_URL}/query_xml?xml=${encodedXml}`;

    console.log(`[Fraktjakt] Calling: ${FRAKTJAKT_API_URL}/query_xml`);

    const fraktjaktResponse = await fetch(queryUrl);
    const responseText = await fraktjaktResponse.text();

    if (!fraktjaktResponse.ok) {
      console.error(`[Fraktjakt] Query failed: ${fraktjaktResponse.status}`);
      console.error(`[Fraktjakt] Response: ${responseText.substring(0, 200)}`);
      throw new Error(`Fraktjakt query failed: ${fraktjaktResponse.status}`);
    }

    // Parse XML response (simplified - just extract service info)
    // In production, use a proper XML parser
    const services = [];
    const serviceMatches = responseText.match(
      /<shipping_service[^>]*>.*?<\/shipping_service>/gs
    );

    if (serviceMatches) {
      serviceMatches.slice(0, 5).forEach((serviceXml) => {
        const idMatch = serviceXml.match(/<id>(\d+)<\/id>/);
        const nameMatch = serviceXml.match(/<name>([^<]+)<\/name>/);
        const carrierMatch = serviceXml.match(/<carrier_name>([^<]+)<\/carrier_name>/);
        const priceMatch = serviceXml.match(/<quoted_price>(\d+(?:\.\d{2})?)<\/quoted_price>/);

        if (idMatch && nameMatch && priceMatch) {
          services.push({
            id: idMatch[1],
            name: nameMatch[1],
            carrier: carrierMatch ? carrierMatch[1] : "Unknown",
            price: Math.round(parseFloat(priceMatch[1])),
            currency: "SEK",
            delivery_time: "Beräknas enligt bud",
          });
        }
      });
    }

    console.log(`[Fraktjakt] Found ${services.length} shipping services`);
    res.json({ services });
  } catch (err) {
    console.error("[Fraktjakt] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Internal server error", detail: err.message || "unknown" });
});

// ============================================================================
// Helper Functions
// ============================================================================

function normalizeProducts(products) {
  return products.map((p, idx) => {
    if (idx === 0) {
      console.log('[DEBUG] Raw product structure:', {
        keys: Object.keys(p),
        id: p.id,
        productId: p.productId,
        product_id: p.product_id,
        sku: p.sku,
        name: p.name,
        attrs: p.attrs ? Object.keys(p.attrs) : null
      });
    }

    let imageObj = null;
    if (p.image) {
      imageObj = typeof p.image === 'string' ? { original: p.image } : p.image;
    } else if (p.image_url) {
      imageObj = { original: p.image_url };
    }

    const brand = p.brand?.name || p.brand || "Unknown";
    const extractedProductId = p.productId || p.product_id || p.id;

    return {
      id: p.id,
      productId: extractedProductId,
      sku: p.sku,
      name: p.name,
      brand: brand,
      dimension: p.dimension || `${p.width}/${p.aspectRatio}R${p.diameter}`,
      width: p.width,
      aspectRatio: p.aspect_ratio || p.aspectRatio,
      diameter: p.diameter,
      seasonType: p.season_type || p.seasonType || p.attrs?.tyreType?.name,
      seasonTypeId: p.type_id || p.typeId || p.attrs?.compoundType?.id,
      price: p.price || p.consumerPrice,
      priceFormatted: formatPrice(p.price || p.consumerPrice || 0),
      stock: p.stock || p.quantity_in_stock || 0,
      image: imageObj,
      supplier_id: p.supplier_id || p.supplierId,
      location_id: p.location_id || p.location?.id,
      type_id: p.type_id || p.typeId,
    };
  });
}

function formatPrice(priceOre) {
  const sek = priceOre / 100;
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(sek);
}

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`
✅ Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Open: http://localhost:${PORT}
🔧 API Routes:
   GET  /api/products?plate=ABC123
   GET  /api/products?width=205&ratio=55&diameter=16
   GET  /api/brands
   POST /api/vehicle
   POST /api/orders
   GET  /api/orders?id=ORDER_ID
   POST /api/bookings
   GET  /api/bookings (admin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Press Ctrl+C to stop
  `);
});
