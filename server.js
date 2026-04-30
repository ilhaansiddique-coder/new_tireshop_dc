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
        const carResponse = await fetch(`${EONTYRE_API_URL}/api/webshop/cars/${cleanPlate}`, {
          method: "POST",
          headers: { "Api-Key": API_KEY },
        });

        if (!carResponse.ok) {
          throw new Error(`Car lookup failed: ${carResponse.status}`);
        }

        const carData = await carResponse.json();
        const car = carData.car || carData;
        const vrd = car.vehicle_registration_data;

        if (!vrd?.tire_width || !vrd?.tire_aspect_ratio || !vrd?.tire_diameter) {
          return res.status(400).json({ error: "Car tire dimensions not found" });
        }

        const params = new URLSearchParams({
          version: "2",
          width: vrd.tire_width,
          aspectRatio: vrd.tire_aspect_ratio,
          diameter: vrd.tire_diameter,
        });

        if (type) params.append("typeId", type);
        if (brand) params.append("brand", brand);

        const productsResponse = await fetch(
          `${EONTYRE_API_URL}/api/webshop/products?${params}`,
          { headers: { "Api-Key": API_KEY } }
        );

        const products = await productsResponse.json();
        const productsList = Array.isArray(products) ? products : (products.data?.products || products.data || []);
        const normalized = normalizeProducts(productsList);

        res.json({
          car: {
            make: vrd.make,
            model: vrd.model,
            year: vrd.year,
            tireDimension: vrd.tire_dimension,
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
      });

      if (type) params.append("typeId", type);
      if (brand) params.append("brand", brand);

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
    const response = await fetch(`${EONTYRE_API_URL}/api/webshop/cars/${cleanPlate}`, {
      method: "POST",
      headers: { "Api-Key": API_KEY },
    });

    const carData = await response.json();
    const car = carData.car || carData;
    const vrd = car.vehicle_registration_data;

    res.json({
      make: vrd?.make,
      model: vrd?.model,
      year: vrd?.year,
      tireDimension: vrd?.tire_dimension,
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
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    dimension: p.dimension,
    width: p.width,
    aspectRatio: p.aspect_ratio || p.aspectRatio,
    diameter: p.diameter,
    seasonType: p.season_type || p.seasonType,
    seasonTypeId: p.type_id || p.typeId,
    price: p.price,
    priceFormatted: formatPrice(p.price || 0),
    stock: p.stock || p.quantity_in_stock || 0,
    image: p.image_url || p.image,
    supplier_id: p.supplier_id,
    location_id: p.location_id,
    sku: p.sku,
  }));
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
