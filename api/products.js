// Proxy to EonTyre products API with number plate support
const EONTYRE_API = process.env.EONTYRE_API_URL || 'https://p511.eontyre.com';
const API_KEY = process.env.EONTYRE_API_KEY;

function normalizeCarDataResponse(data) {
  if (!data) return null;

  const car = data.car || data;
  if (!car.vehicle_registration_data) return car;

  const vrd = car.vehicle_registration_data;
  return {
    make: vrd.make,
    model: vrd.model,
    year: vrd.year,
    tireDimension: vrd.tire_dimension,
    tireWidth: vrd.tire_width,
    tireAspectRatio: vrd.tire_aspect_ratio,
    tireDiameter: vrd.tire_diameter,
    tireSeasonType: vrd.tire_season_type,
    ...car
  };
}

function normalizeProductsResponse(data) {
  let products = [];

  if (Array.isArray(data)) {
    products = data;
  } else if (data?.data?.products && Array.isArray(data.data.products)) {
    // EonTyre API v2 format: { data: { products: [...] } }
    products = data.data.products;
  } else if (data?.data && Array.isArray(data.data)) {
    products = data.data;
  } else if (data?.products && Array.isArray(data.products)) {
    products = data.products;
  }

  return products.map(p => {
    const brandName = (p.brand || '').toUpperCase().trim();
    const brandLogoUrl = `https://logo.clearbit.com/${brandName.toLowerCase()}.com`;

    return {
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
      priceFormatted: new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format((p.price || 0) / 100),
      stock: p.stock || p.quantity_in_stock || 0,
      image: p.image_url || p.image || brandLogoUrl,
      supplier_id: p.supplier_id,
      location_id: p.location_id,
      sku: p.sku
    };
  });
}

async function lookupCarByPlate(plate) {
  const cleanPlate = (plate || '').replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (!cleanPlate) throw new Error('Invalid plate');

  const url = `${EONTYRE_API}/api/webshop/cars/${cleanPlate}`;
  console.log(`[EonTyre API] Looking up car plate: ${cleanPlate} at ${url}`);
  console.log(`[EonTyre API] Using API Key: ${API_KEY ? 'configured' : 'MISSING'}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Api-Key': API_KEY },
      timeout: 10000
    });

    console.log(`[EonTyre API] Car lookup response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[EonTyre API] Car lookup error: ${errorText.substring(0, 200)}`);
      throw new Error(`Car lookup failed: ${res.status}`);
    }

    const data = await res.json();
    console.log(`[EonTyre API] Car found: ${data?.make} ${data?.model}`);
    return data;
  } catch (err) {
    console.error(`[EonTyre API] Car lookup fetch error: ${err.message}`);
    throw err;
  }
}

async function searchProductsBySize(width, ratio, diameter, typeId = null, brandId = null) {
  const params = new URLSearchParams({
    version: '2',
    width,
    aspectRatio: ratio,
    diameter,
    typeId: typeId || '1',
    searchMode: '4',
    webshopId: '38',
    limit: '100',
    page: '1'
  });

  if (brandId) params.append('query', brandId);

  const url = `${EONTYRE_API}/api/webshop/products?${params}`;
  console.log(`[EonTyre API] Searching at: ${EONTYRE_API}/api/webshop/products`);
  console.log(`[EonTyre API] Params: width=${width}, ratio=${ratio}, diameter=${diameter}`);
  console.log(`[EonTyre API] Using API Key: ${API_KEY ? 'yes' : 'MISSING'}`);

  try {
    const res = await fetch(url, {
      headers: { 'Api-Key': API_KEY }
    });

    console.log(`[EonTyre API] Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[EonTyre API] Error (${res.status}): ${errorText.substring(0, 300)}`);
      throw new Error(`Product search failed: ${res.status}`);
    }

    const data = await res.json();
    console.log(`[EonTyre API] Raw response keys: ${Object.keys(data).join(', ')}`);
    return data;
  } catch (err) {
    console.error(`[EonTyre API] Fetch failed: ${err.message}`);
    throw err;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { plate, width, ratio, diameter, type, brand } = req.query;

    if (plate) {
      // Plate-based search: lookup car, extract tire size, search products
      let carData;
      try {
        carData = await lookupCarByPlate(plate);
      } catch (err) {
        return res.status(404).json({
          error: `Car registration "${plate}" not found in EonTyre database`
        });
      }
      const car = normalizeCarDataResponse(carData);

      if (!car.tireWidth || !car.tireAspectRatio || !car.tireDiameter) {
        return res.status(400).json({ error: 'Car tire dimensions not found' });
      }

      const products = await searchProductsBySize(
        car.tireWidth,
        car.tireAspectRatio,
        car.tireDiameter,
        type ? parseInt(type) : null,
        brand
      );

      const normalized = normalizeProductsResponse(products);

      return res.json({
        car,
        products: normalized,
        tiresFound: normalized.length
      });
    } else if (width && ratio && diameter) {
      // Direct size search
      const products = await searchProductsBySize(
        width,
        ratio,
        diameter,
        type ? parseInt(type) : null,
        brand
      );

      const normalized = normalizeProductsResponse(products);

      return res.json({
        products: normalized,
        tiresFound: normalized.length
      });
    } else {
      return res.status(400).json({
        error: 'Provide either plate OR (width, ratio, diameter)'
      });
    }
  } catch (err) {
    console.error('[Products API] Error:', err.message);
    console.error('[Products API] Stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
}
