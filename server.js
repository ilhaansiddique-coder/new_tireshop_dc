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

console.log(`[CORS] Allowed origins from FRONTEND_URL: ${allowedOrigins.length > 0 ? allowedOrigins.join(", ") : "(none configured)"}`);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // No origin header = same-origin request, allow it
        return callback(null, true);
      }

      // Allow local development
      const isLocalDev =
        NODE_ENV !== "production" &&
        (/^http:\/\/localhost(:\d+)?$/.test(origin) ||
          /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin));

      // Allow whitelisted origins
      const isWhitelisted = allowedOrigins.includes(origin);

      // If no origins are configured, allow all for development
      const noOriginsConfigured = allowedOrigins.length === 0;

      if (isWhitelisted || isLocalDev || noOriginsConfigured) {
        console.log(`[CORS] ✅ Allowed origin: ${origin}`);
        return callback(null, true);
      }

      console.warn(`[CORS] ❌ Blocked origin: ${origin}`);
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

function parseTireDimension(dimension) {
  if (!dimension || !dimension.trim()) return null;
  const cleaned = dimension.replace(/\s+/g, '').toUpperCase();
  const patterns = [
    /^(\d+)\/(\d+)\s*[Rr](\d+)$/, // 225/50 R16
    /^(\d+)\/(\d+)\/(\d+)$/, // 225/50/16
    /^(\d+)-(\d+)-(\d+)$/, // 225-50-16
  ];
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      return { width: match[1], ratio: match[2], diameter: match[3] };
    }
  }
  return null;
}

// GET /api/products — search tires by plate or size
app.get("/api/products", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "Server missing API_KEY" });
    }

    const { plate, width, ratio, diameter, type, brand, dimension } = req.query;

    if (plate) {
      // Plate-based search
      const cleanPlate = plate.replace(/[^A-Z0-9]/g, "").toUpperCase();
      console.log(`[Products] Searching by plate: ${cleanPlate}`);
      console.log(`[Products] API_KEY configured: ${API_KEY ? "✅ Yes (length: " + API_KEY.length + ")" : "❌ No"}`);
      console.log(`[Products] EONTYRE_API_URL: ${EONTYRE_API_URL}`);

      try {
        const carUrl = `${EONTYRE_API_URL}/api/webshop/cars/${encodeURIComponent(cleanPlate)}`;
        console.log(`[Products] Full request URL: ${carUrl}`);
        console.log(`[Products] Request headers: Accept=application/json, Api-Key=${API_KEY ? API_KEY.substring(0, 5) + "..." : "MISSING"}`);

        const carResponse = await fetch(carUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Api-Key": API_KEY
          }
        });

        console.log(`[Products] EonTyre response status: ${carResponse.status} ${carResponse.statusText}`);

        if (!carResponse.ok) {
          const errorText = await carResponse.text();
          console.log(`[Products] EonTyre error response (first 500 chars): ${errorText.substring(0, 500)}`);
          throw new Error(`Car lookup failed: ${carResponse.status} - ${errorText.substring(0, 100)}`);
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
    } else if (dimension) {
      // Dimension string search (e.g., "225/50 R16")
      const parsed = parseTireDimension(dimension);
      if (!parsed) {
        return res.status(400).json({
          error: 'Invalid tire dimension format. Use format like: 225/50 R16'
        });
      }

      const params = new URLSearchParams({
        version: "2",
        width: parsed.width,
        aspectRatio: parsed.ratio,
        diameter: parsed.diameter,
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

        res.json({
          products: normalized,
          tiresFound: normalized.length,
          dimension: `${parsed.width}/${parsed.ratio} R${parsed.diameter}`
        });
      } catch (err) {
        console.error("[Products] Error:", err.message);
        res.status(500).json({ error: err.message });
      }
    } else {
      res.status(400).json({ error: "Provide either plate, dimension, or (width, ratio, diameter)" });
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

    if (!response.ok) {
      return res.status(404).json({
        error: `Car registration "${plate}" not found in EonTyre database`
      });
    }

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

// GET /api/qliro/test — Test Qliro configuration (for debugging)
app.get("/api/qliro/test", (req, res) => {
  try {
    const mockMode = !QLIRO_API_KEY || !QLIRO_API_SECRET || QLIRO_API_KEY === "DACKA";

    res.json({
      status: "ok",
      environment: {
        NODE_ENV,
        QLIRO_API_KEY: QLIRO_API_KEY ? "***" + QLIRO_API_KEY.slice(-4) : "(not set)",
        QLIRO_API_SECRET: QLIRO_API_SECRET ? "***" + QLIRO_API_SECRET.slice(-4) : "(not set)",
        QLIRO_API_URL,
      },
      mockMode,
      mockReason: mockMode ?
        (!QLIRO_API_KEY ? "API Key not set" :
         !QLIRO_API_SECRET ? "API Secret not set" :
         QLIRO_API_KEY === "DACKA" ? "Test key DACKA detected (mock mode)" : "Unknown")
        : "Using real API",
      message: mockMode ?
        "✅ Mock mode active - payments will auto-complete in test mode" :
        "🔌 Real Qliro API configured"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Generate Basic Auth header
function generateBasicAuth(key, secret) {
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

// POST /api/qliro/create-checkout — Create Qliro checkout session
app.post("/api/qliro/create-checkout", async (req, res) => {
  try {
    const { customerData, cartItems, deliveryOption, shipping } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!customerData || !customerData.email) {
      return res.status(400).json({ error: "Customer email required" });
    }

    const pendingId = uuidv4();
    const callbackToken = uuidv4();

    console.log(`[Qliro] ========== Creating checkout for ${pendingId} ==========`);
    console.log(`[Qliro] NODE_ENV: ${NODE_ENV}`);
    console.log(`[Qliro] QLIRO_API_KEY: ${QLIRO_API_KEY}`);
    console.log(`[Qliro] QLIRO_API_SECRET: ${QLIRO_API_SECRET ? "***" : "(not set)"}`);
    console.log(`[Qliro] BASE_URL: ${BASE_URL}`);

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
        MerchantReference: (item.productId || item.id || '').toString(),
        Description: item.name,
        Type: "Product",
        Quantity: item.quantity,
        PricePerItemIncVat: item.price / 100,
        PricePerItemExVat: (item.price / 100) / 1.25,
      })),
      CustomerInformation: { Email: customerData.email },
    };

    console.log(`[Qliro] Order payload:`, JSON.stringify(qliroOrder, null, 2));

    // For local testing: mock Qliro response if credentials are test key
    let createData, iframeSnippet, qliroOrderId;
    const isMockMode = !QLIRO_API_KEY || !QLIRO_API_SECRET || QLIRO_API_KEY === "DACKA";

    console.log(`[Qliro] Mock mode: ${isMockMode}`);
    console.log(`[Qliro] API Key check: "${QLIRO_API_KEY}" === "DACKA" ? ${QLIRO_API_KEY === "DACKA"}`);

    if (isMockMode) {
      console.log(`[Qliro] ✅ ENTERING MOCK MODE`);
      qliroOrderId = `mock-qliro-${pendingId.substring(0, 8)}`;
      iframeSnippet = `
        <div style="border: 2px solid #0ea5e9; padding: 20px; border-radius: 8px; background: #f0f9ff; text-align: center;">
          <h3 style="color: #0c4a6e; margin-top: 0;">🧪 Qliro Payment Form (Test Mode)</h3>
          <p style="color: #0c4a6e; margin: 10px 0;">API credentials are not configured.</p>
          <p style="color: #0c4a6e; font-size: 14px; margin: 10px 0;">In production with valid credentials, Qliro's payment form would appear here.</p>
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #cbd5e1;">
            <p style="font-size: 12px; color: #666; margin: 0;">To use real Qliro payments on Coolify:</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">1. Get Qliro API credentials from https://developers.qliro.com</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">2. Set environment variables on Coolify dashboard:</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0; padding-left: 12px;">QLIRO_API_KEY = your_api_key</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0; padding-left: 12px;">QLIRO_API_SECRET = your_api_secret</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">3. Redeploy the application</p>
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
              console.log(`[Qliro] Mock IIFE: starting EonTyre order. customerData keys: ${Object.keys(mockPending.customerData || {}).join(',')}`);
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

              console.log(`[Qliro] Mock IIFE: calling EonTyre API at ${EONTYRE_API_URL}/api/v2/orders`);
              const eontryeController = new AbortController();
              const eontryeTimeout = setTimeout(() => eontryeController.abort(), 15000);
              const eontryeResponse = await fetch(`${EONTYRE_API_URL}/api/v2/orders`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Api-Key": API_KEY,
                },
                body: JSON.stringify(eontryeOrder),
                signal: eontryeController.signal,
              });
              clearTimeout(eontryeTimeout);
              console.log(`[Qliro] Mock IIFE: EonTyre response status ${eontryeResponse.status}`);
              const eontryeData = await eontryeResponse.json();
              if (!eontryeResponse.ok || eontryeData.err) {
                console.error(`[EonTyre] Order creation failed: ${eontryeResponse.status} — ${eontryeData.err || JSON.stringify(eontryeData).substring(0, 300)}`);
              }
              if (eontryeResponse.ok && !eontryeData.err) {
                const eontryeOrderId = eontryeData.data?.id;
                mockPending.eontyre = {
                  orderId: eontryeOrderId,
                  bookingUrl: eontryeData.data?.booking_url,
                };
                console.log(`[Qliro] Mock payment: EonTyre order created ${eontryeOrderId}`);

                // Book courier for home delivery
                if (mockPending.deliveryOption === 1 && mockPending.shipping) {
                  const fraktjaktResult = await bookFraktjaktShipment(mockPending, eontryeOrderId);
                  if (fraktjaktResult) mockPending.fraktjakt = fraktjaktResult;
                } else {
                  console.log(`[Qliro] Mock payment: Pickup order — skipping Fraktjakt`);
                }
              }
            } catch (err) {
              console.error(`[Qliro] Mock payment: Error creating EonTyre order`, err.message);
            }
          })();
        }
      }, 3000);
    } else {
      // Real Qliro API call
      try {
        console.log(`[Qliro] Attempting real API call to ${QLIRO_API_URL}`);
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
          throw new Error(`Qliro API returned ${createResponse.status}: ${errorText}`);
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
      } catch (err) {
        console.error(`[Qliro] Real API failed: ${err.message}`);
        console.log(`[Qliro] Falling back to mock mode...`);
        // Fall back to mock mode
        qliroOrderId = `mock-qliro-${pendingId.substring(0, 8)}`;
        iframeSnippet = `
          <div style="border: 2px solid #0ea5e9; padding: 20px; border-radius: 8px; background: #f0f9ff; text-align: center;">
            <h3 style="color: #0c4a6e; margin-top: 0;">🧪 Qliro Payment Form (Test Mode - API Fallback)</h3>
            <p style="color: #0c4a6e; margin: 10px 0;">Real API connection failed, using test mode.</p>
            <p style="color: #0c4a6e; font-size: 14px; margin: 10px 0; color: #dc2626;">Error: ${err.message}</p>
            <p style="color: #10b981; font-weight: bold; margin-top: 15px; font-size: 14px;">✅ Payment will auto-complete in 3 seconds for testing...</p>
          </div>
        `;

        // Auto-complete payment in test mode — run the full post-payment flow
        setTimeout(async () => {
          const mockPending = pendingOrders.get(pendingId);
          if (!mockPending || mockPending.status !== "pending") return;

          console.log(`[Qliro] Auto-completing fallback payment for: ${pendingId}`);
          mockPending.qliroPaymentId = `mock-payment-${uuidv4()}`;

          // Create EonTyre order
          try {
            const eontryeOrder = {
              customer: {
                type: mockPending.customerData.type || 2,
                name: mockPending.customerData.name,
                address1: mockPending.customerData.address1 || "",
                address2: mockPending.customerData.address2 || "",
                postal_code: mockPending.customerData.postal_code || "",
                city: mockPending.customerData.city || "",
                country: "SE",
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

            console.log(`[Qliro Mock] Creating EonTyre order...`);
            const eontryeResponse = await fetch(`${EONTYRE_API_URL}/api/v2/orders`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Api-Key": API_KEY },
              body: JSON.stringify(eontryeOrder),
            });
            const eontryeData = await eontryeResponse.json();

            if (!eontryeResponse.ok || eontryeData.err) {
              throw new Error(`EonTyre error: ${eontryeData.err || eontryeResponse.status}`);
            }

            const eontryeOrderId = eontryeData.data?.id;
            console.log(`[Qliro Mock] EonTyre order created: ${eontryeOrderId}`);

            // Book courier for home delivery
            let fraktjaktResult = null;
            if (mockPending.deliveryOption === 1 && mockPending.shipping) {
              fraktjaktResult = await bookFraktjaktShipment(mockPending, eontryeOrderId);
            } else {
              console.log(`[Qliro Mock] Pickup order — skipping Fraktjakt`);
            }

            mockPending.status = "paid";
            mockPending.eontyre = {
              orderId: eontryeOrderId,
              bookingUrl: eontryeData.data?.booking_url,
            };
            if (fraktjaktResult) mockPending.fraktjakt = fraktjaktResult;

          } catch (err) {
            console.error(`[Qliro Mock] EonTyre order failed:`, err.message);
            mockPending.status = "paid"; // still mark paid so UI moves forward
          }
        }, 3000);
      }
    }

    // Store pending order
    pendingOrders.set(pendingId, {
      customerData,
      cartItems,
      deliveryOption,
      shipping: shipping || null,
      qliroOrderId,
      callbackToken,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    console.log(`[Qliro] Stored pending order: ${pendingId}`);
    console.log(`[Qliro] Responding with: pendingId=${pendingId}, qliroOrderId=${qliroOrderId}, iframeSnippet length=${iframeSnippet?.length || 0}`);

    res.json({ pendingId, qliroOrderId, iframeSnippet });
  } catch (err) {
    console.error("[Qliro] ❌ ERROR creating checkout!");
    console.error("[Qliro] Error message:", err.message);
    console.error("[Qliro] Error stack:", err.stack);
    console.error("[Qliro] Full error:", err);
    res.status(500).json({
      error: err.message,
      details: err.stack,
      timestamp: new Date().toISOString()
    });
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

      const eontryeOrderId = eontryeData.data?.id;
      console.log(`[Qliro Callback] EonTyre order created: ${eontryeOrderId}`);

      // Book courier shipment for home delivery orders
      let fraktjaktResult = null;
      if (pending.deliveryOption === 1 && pending.shipping) {
        fraktjaktResult = await bookFraktjaktShipment(pending, eontryeOrderId);
      } else {
        console.log(`[Qliro Callback] Pickup order — skipping Fraktjakt booking`);
      }

      // Update pending order with results
      pending.status = "paid";
      pending.qliroPaymentId = OrderId;
      pending.eontyre = {
        orderId: eontryeOrderId,
        bookingUrl: eontryeData.data?.booking_url,
      };
      if (fraktjaktResult) {
        pending.fraktjakt = fraktjaktResult;
      }
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
      tracking: pending.fraktjakt?.trackingUrl || null,
      shippingLabel: pending.fraktjakt?.labelUrl || null,
    });
  } catch (err) {
    console.error("[Qliro Status] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Fraktjakt Shipping Routes
// ============================================================================

// Fallback shipping options if Fraktjakt fails
const getFallbackShippingOptions = () => {
  return [
    { id: "postnord", name: "PostNord Varubrev", price: 49, delivery_time: "2-3 dagar" },
    { id: "dhl", name: "DHL Paket", price: 99, delivery_time: "1-2 dagar" },
    { id: "bring", name: "Bring Express", price: 129, delivery_time: "1 dag" }
  ];
};

// XML-escape helper used by both booking modes
const xmlEscape = (s) => String(s || "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));

// ─────────────────────────────────────────────────────────────────────────────
// FRAKTJAKT BOOKING MODE
// ─────────────────────────────────────────────────────────────────────────────
// Two ways to send shipments to Fraktjakt — switch by setting env var
// FRAKTJAKT_BOOKING_MODE in .env.local (or Coolify env vars).
//
// Mode "shipment" (DEFAULT — what we use right now)
//   → Calls Fraktjakt's Shipment API.
//   → Creates a draft shipment in the Fraktjakt dashboard.
//   → Admin manually picks the carrier (DHL/PostNord/etc) and pays in Fraktjakt UI.
//   → Best while you're still tuning the integration — admin reviews each shipment.
//   → The customer's shipping pick on our checkout page is IGNORED here
//     (admin chooses again in Fraktjakt). That's fine for low volume.
//
// Mode "order" (Order API type 1 — for auto-booking later)
//   → Calls Fraktjakt's Order API type 1.
//   → Honors the carrier the customer chose at checkout (uses shipping_product_id).
//   → Reuses the shipment_id Fraktjakt issued during the earlier Query API call
//     (we attach it to each option in /api/shipping/query and the frontend passes
//     it back inside the selected `shipping` object).
//   → IMPORTANT: even in "order" mode the shipment still drops into Fraktjakt's
//     cart unless you've enabled invoice/credit billing on consignor 39289.
//     To get fully automatic label-buying, email api@fraktjakt.se and ask them
//     to enable auto-pay/invoice billing on the account, then set this to "order".
//
// To switch: in Coolify (or .env.local) add  FRAKTJAKT_BOOKING_MODE=order  and redeploy.
// If "order" mode is set but the shipment_id or product_id is missing
// (e.g. fallback shipping options were used), it auto-falls-back to the Shipment API.
// ─────────────────────────────────────────────────────────────────────────────
const FRAKTJAKT_BOOKING_MODE = (process.env.FRAKTJAKT_BOOKING_MODE || "shipment").toLowerCase();

// Mode 1: Shipment API — creates a shipment that admin selects service for in the Fraktjakt dashboard.
const bookViaShipmentApi = async (pending, eontryeOrderId) => {
  const { customerData, cartItems } = pending;
  const articleNumber = cartItems[0]?.sku || cartItems[0]?.productId || "TYRE001";
  const productName = cartItems[0]?.name || "Tyres";
  const unitPrice = cartItems[0]?.price || 0;
  const totalQuantity = cartItems.reduce((s, i) => s + i.quantity, 0);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CreateShipment>
  <consignor>
    <id>${FRAKTJAKT_ID}</id>
    <key>${FRAKTJAKT_KEY}</key>
    <currency>SEK</currency>
    <language>en</language>
    <encoding>UTF-8</encoding>
    <system_name>Dackcentrum</system_name>
    <module_version>1.0</module_version>
    <api_version>4.10.0</api_version>
  </consignor>
  <reference>EONTYRE-${eontryeOrderId || ""}</reference>
  <recipient>
    <name_to>${xmlEscape(customerData.name)}</name_to>
    <telephone_to>${xmlEscape(customerData.phone)}</telephone_to>
    <email_to>${xmlEscape(customerData.email)}</email_to>
  </recipient>
  <address_to>
    <street_address_1>${xmlEscape(customerData.address1)}</street_address_1>
    <postal_code>${(customerData.postal_code || "").replace(/\s/g, "")}</postal_code>
    <residential>1</residential>
    <country_code>SE</country_code>
    <language>sv</language>
  </address_to>
  <commodities>
    <commodity>
      <name>${xmlEscape(productName)}</name>
      <quantity>${totalQuantity}</quantity>
      <quantity_units>EA</quantity_units>
      <description>Tyres</description>
      <country_of_manufacture>SE</country_of_manufacture>
      <weight>8</weight>
      <length>63</length>
      <width>63</width>
      <height>25</height>
      <unit_price>${unitPrice}</unit_price>
      <shipped>1</shipped>
      <in_own_parcel>false</in_own_parcel>
      <article_number>${xmlEscape(articleNumber)}</article_number>
    </commodity>
  </commodities>
</CreateShipment>`;

  const shipmentUrl = `https://api.fraktjakt.se/shipments/shipment_xml?xml=${encodeURIComponent(xml)}`;
  console.log(`[Fraktjakt] 📦 [Shipment API] Creating shipment for EonTyre order ${eontryeOrderId}...`);
  const response = await fetch(shipmentUrl);
  const responseText = await response.text();
  console.log(`[Fraktjakt] 📬 Shipment response (first 800): ${responseText.substring(0, 800)}`);

  if (!response.ok) throw new Error(`Fraktjakt shipment_xml returned ${response.status}`);

  const errMatch = responseText.match(/<error_message>([^<]+)<\/error_message>/);
  if (errMatch && errMatch[1].trim()) {
    console.error(`[Fraktjakt] ❌ Shipment creation error: ${errMatch[1]}`);
    return null;
  }

  return {
    shipmentId: responseText.match(/<shipment_id>(\d+)<\/shipment_id>/)?.[1] || null,
    labelUrl: responseText.match(/<access_link>([^<]+)<\/access_link>/)?.[1] || null,
    trackingUrl: responseText.match(/<tracking_link>([^<]+)<\/tracking_link>/)?.[1] || null,
  };
};

// Mode 2: Order API type 1 — confirms a Query API shipment with the customer's chosen shipping service.
// Requires shipment.fraktjaktShipmentId (from Query API) and shipping_product_id (numeric, from "fraktjakt-NNN").
const bookViaOrderApi = async (pending, eontryeOrderId) => {
  const { customerData, shipping } = pending;
  const fraktjaktShipmentId = shipping?.fraktjaktShipmentId;
  const shippingProductId = shipping?.id ? String(shipping.id).replace("fraktjakt-", "") : "";

  if (!fraktjaktShipmentId || !shippingProductId || !/^\d+$/.test(shippingProductId)) {
    console.warn(`[Fraktjakt] Order API needs both shipment_id (${fraktjaktShipmentId}) and numeric shipping_product_id (${shippingProductId}); falling back to Shipment API`);
    return bookViaShipmentApi(pending, eontryeOrderId);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OrderSpecification>
  <consignor>
    <id>${FRAKTJAKT_ID}</id>
    <key>${FRAKTJAKT_KEY}</key>
    <currency>SEK</currency>
    <language>en</language>
    <encoding>utf-8</encoding>
    <system_name>Dackcentrum</system_name>
    <module_version>1.0</module_version>
    <api_version>4.10.0</api_version>
  </consignor>
  <shipment_id>${fraktjaktShipmentId}</shipment_id>
  <shipping_product_id>${shippingProductId}</shipping_product_id>
  <reference>EONTYRE-${eontryeOrderId || ""}</reference>
  <recipient>
    <name_to>${xmlEscape(customerData.name)}</name_to>
    <telephone_to>${xmlEscape(customerData.phone)}</telephone_to>
    <email_to>${xmlEscape(customerData.email)}</email_to>
    <mobile_to>${xmlEscape(customerData.phone)}</mobile_to>
  </recipient>
</OrderSpecification>`;

  const orderUrl = `https://api.fraktjakt.se/orders/order_xml?xml=${encodeURIComponent(xml)}`;
  console.log(`[Fraktjakt] 📦 [Order API t1] Confirming shipment ${fraktjaktShipmentId} with product ${shippingProductId} for EonTyre order ${eontryeOrderId}...`);
  const response = await fetch(orderUrl);
  const responseText = await response.text();
  console.log(`[Fraktjakt] 📬 Order response (first 800): ${responseText.substring(0, 800)}`);

  if (!response.ok) throw new Error(`Fraktjakt orders/order_xml returned ${response.status}`);

  const errMatch = responseText.match(/<error_message>([^<]+)<\/error_message>/);
  if (errMatch && errMatch[1].trim()) {
    console.error(`[Fraktjakt] ❌ Order API error: ${errMatch[1]}`);
    return null;
  }

  return {
    shipmentId: responseText.match(/<shipment_id>(\d+)<\/shipment_id>/)?.[1] || fraktjaktShipmentId,
    labelUrl: responseText.match(/<access_link>([^<]+)<\/access_link>/)?.[1] || null,
    trackingUrl: responseText.match(/<tracking_link>([^<]+)<\/tracking_link>/)?.[1] || null,
  };
};

// Book a shipment with Fraktjakt after confirmed payment (home delivery only)
const bookFraktjaktShipment = async (pending, eontryeOrderId) => {
  if (!FRAKTJAKT_ID || !FRAKTJAKT_KEY) {
    console.warn("[Fraktjakt] ⚠️ Credentials not configured — skipping shipment booking");
    return null;
  }

  try {
    const result = FRAKTJAKT_BOOKING_MODE === "order"
      ? await bookViaOrderApi(pending, eontryeOrderId)
      : await bookViaShipmentApi(pending, eontryeOrderId);

    if (result) {
      console.log(`[Fraktjakt] ✅ Shipment booked (mode=${FRAKTJAKT_BOOKING_MODE}): ID=${result.shipmentId}, access=${result.labelUrl}`);
    }
    return result;
  } catch (err) {
    console.error(`[Fraktjakt] ❌ Failed to book shipment:`, err.message);
    return null;
  }
};

// Query Fraktjakt API for real shipping options
const queryFraktjaktAPI = async (postalCode, city, address, items, deliveryOption) => {
  try {
    console.log(`[Fraktjakt] 🚚 Querying API for postal code: ${postalCode}`);

    // Build XML payload for Fraktjakt API v2
    const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 8), 0); // 8kg per tire
    const articleNumber = items[0]?.sku || items[0]?.productId || 'TYRE001';

    const totalValue = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<shipment xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <value>${totalValue.toFixed(2)}</value>
  <shipper_info>1</shipper_info>
  <consignor>
    <id>${FRAKTJAKT_ID}</id>
    <key>${FRAKTJAKT_KEY}</key>
    <currency>SEK</currency>
    <language>en</language>
  </consignor>
  <parcels>
    <parcel>
      <weight>${totalWeight}</weight>
      <length>63</length>
      <width>63</width>
      <height>25</height>
    </parcel>
  </parcels>
  <address_to>
    <street_address_1>${address || ""}</street_address_1>
    <postal_code>${postalCode.replace(/\s/g, "")}</postal_code>
    <city>${city || ""}</city>
    <country_code>SE</country_code>
  </address_to>
</shipment>`;

    const encodedXml = encodeURIComponent(xml);
    const queryUrl = `${FRAKTJAKT_API_URL}/query_xml?xml=${encodedXml}`;

    console.log(`[Fraktjakt] 📡 Calling Fraktjakt API...`);
    const response = await fetch(queryUrl, { timeout: 10000 });
    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[Fraktjakt] ❌ API returned status ${response.status}`);
      console.error(`[Fraktjakt] Response: ${responseText.substring(0, 300)}`);
      throw new Error(`Fraktjakt API error: ${response.status}`);
    }

    console.log(`[Fraktjakt] Raw response (first 800): ${responseText.substring(0, 800)}`);

    const errMatch = responseText.match(/<error_message>([^<]+)<\/error_message>/);
    if (errMatch && errMatch[1].trim()) {
      console.error(`[Fraktjakt] ❌ API error: ${errMatch[1]}`);
      return getFallbackShippingOptions();
    }

    // Capture the Fraktjakt shipment_id from the query — needed for Order API type 1 booking later
    const queryShipmentIdMatch = responseText.match(/<shipment_id>(\d+)<\/shipment_id>/);
    const fraktjaktShipmentId = queryShipmentIdMatch?.[1] || null;

    // Parse XML — response uses <shipping_products><shipping_product> elements
    const services = [];
    const productMatches = responseText.match(/<shipping_product>.*?<\/shipping_product>/gs) || [];
    console.log(`[Fraktjakt] 📦 Found ${productMatches.length} shipping products in response (shipment_id=${fraktjaktShipmentId})`);

    productMatches.slice(0, 10).forEach((xml, idx) => {
      try {
        const idMatch = xml.match(/<id>(\d+)<\/id>/);
        const nameMatch = xml.match(/<name>([^<]+)<\/name>/);
        const shipperMatch = xml.match(/<shipper>.*?<name>([^<]+)<\/name>.*?<\/shipper>/s);
        const priceMatch = xml.match(/<price>(\d+(?:\.\d+)?)<\/price>/);
        const arrivalMatch = xml.match(/<arrival_time>([^<]+)<\/arrival_time>/);

        if (idMatch && nameMatch && priceMatch) {
          services.push({
            id: `fraktjakt-${idMatch[1]}`,
            name: nameMatch[1],
            carrier: shipperMatch ? shipperMatch[1] : "Unknown",
            price: Math.round(parseFloat(priceMatch[1])),
            delivery_time: arrivalMatch ? arrivalMatch[1] : "Beräknas enligt bud",
            fraktjaktShipmentId,
          });
          console.log(`[Fraktjakt] ✓ Service ${idx + 1}: ${nameMatch[1]} - ${Math.round(parseFloat(priceMatch[1]))} kr`);
        }
      } catch (e) {
        console.error(`[Fraktjakt] ⚠️ Error parsing product ${idx}:`, e.message);
      }
    });

    if (services.length === 0) {
      console.warn(`[Fraktjakt] ⚠️ No services parsed, using fallback`);
      return getFallbackShippingOptions();
    }

    console.log(`[Fraktjakt] ✅ Successfully retrieved ${services.length} shipping options`);
    return services;
  } catch (err) {
    console.error(`[Fraktjakt] ❌ Error querying API:`, err.message);
    return getFallbackShippingOptions();
  }
};

// POST /api/shipping/query — Query available shipping methods
app.post("/api/shipping/query", async (req, res) => {
  try {
    const { postal_code, city, address1, items, delivery_option } = req.body;

    console.log(`\n[Shipping] 📥 Request received`);
    console.log(`[Shipping]   - postal_code: ${postal_code}`);
    console.log(`[Shipping]   - city: ${city}`);
    console.log(`[Shipping]   - address: ${address1}`);
    console.log(`[Shipping]   - items: ${items?.length || 0}`);
    console.log(`[Shipping]   - delivery_option: ${delivery_option}`);

    // Validation
    if (!postal_code) {
      console.log(`[Shipping] ❌ Missing postal_code`);
      return res.status(400).json({ error: "postal_code required" });
    }

    if (!items || items.length === 0) {
      console.log(`[Shipping] ❌ Missing items`);
      return res.status(400).json({ error: "items required" });
    }

    // Check if Fraktjakt credentials are configured
    if (!FRAKTJAKT_ID || !FRAKTJAKT_KEY) {
      console.log(`[Shipping] ⚠️ Fraktjakt credentials not configured, using fallback`);
      const fallback = getFallbackShippingOptions();
      return res.json({ services: fallback });
    }

    // Query Fraktjakt API for real shipping options
    console.log(`[Shipping] 🔄 Querying Fraktjakt API...`);
    const services = await queryFraktjaktAPI(postal_code, city, address1, items, delivery_option);

    console.log(`[Shipping] ✅ Returning ${services.length} shipping options\n`);
    return res.json({ services });
  } catch (err) {
    console.error(`[Shipping] ❌ Error:`, err.message);
    // Always return fallback services on error
    const fallback = getFallbackShippingOptions();
    return res.status(200).json({ services: fallback });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Clean URL routes — redirect .html → clean path, serve file on clean path
app.get("/checkout.html", (req, res) => res.redirect(301, "/checkout"));
app.get("/checkout", (req, res) => res.sendFile(path.join(__dirname, "checkout.html")));

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
