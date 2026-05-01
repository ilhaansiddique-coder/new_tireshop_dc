// Vercel Serverless Function - Shipping Query Endpoint

const FRAKTJAKT_ID = process.env.FRAKTJAKT_CONSIGNOR_ID || "";
const FRAKTJAKT_KEY = process.env.FRAKTJAKT_CONSIGNOR_KEY || "";
const SHOP_ORIGIN_STREET = process.env.SHOP_ORIGIN_STREET || "";
const SHOP_ORIGIN_POSTAL = process.env.SHOP_ORIGIN_POSTAL || "25220";
const SHOP_ORIGIN_CITY = process.env.SHOP_ORIGIN_CITY || "Helsingborg";
const FRAKTJAKT_API_URL = "https://api.fraktjakt.se/fraktjakt";

const getServices = (delivery_option) => {
  if (delivery_option === '0') {
    // Local pickup - only DHL and Schenker options
    return [
      {
        id: "schenker-parcel-home",
        name: "Schenker Parcel Home",
        carrier: "Schenker",
        price: 89,
        currency: "SEK",
        delivery_time: "1-2 dagar",
      },
      {
        id: "dhl-notification",
        name: "DHL Package with notification (Several package shipping)",
        carrier: "DHL",
        price: 99,
        currency: "SEK",
        delivery_time: "1-2 dagar",
      },
      {
        id: "dhl-home-delivery",
        name: "DHL home delivery (Several package shipping)",
        carrier: "DHL",
        price: 129,
        currency: "SEK",
        delivery_time: "1 dag",
      },
    ];
  } else {
    // Home delivery - standard options
    return [
      {
        id: "postnord",
        name: "PostNord Varubrev",
        carrier: "PostNord",
        price: 49,
        currency: "SEK",
        delivery_time: "2-3 dagar",
      },
      {
        id: "dhl",
        name: "DHL Paket",
        carrier: "DHL",
        price: 99,
        currency: "SEK",
        delivery_time: "1-2 dagar",
      },
      {
        id: "bring",
        name: "Bring Express",
        carrier: "Bring",
        price: 129,
        currency: "SEK",
        delivery_time: "1 dag",
      },
    ];
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postal_code, city, address1, items, delivery_option } = req.body;

    if (!postal_code || !items || items.length === 0) {
      return res.status(400).json({ error: "postal_code and items required" });
    }

    console.log(`[Fraktjakt] Query for: ${address1}, ${postal_code} ${city}, delivery: ${delivery_option}`);

    // Mock mode - return test shipping options
    if (!FRAKTJAKT_ID || !FRAKTJAKT_KEY) {
      console.log(`[Fraktjakt] MOCK MODE - no credentials configured`);
      const mockServices = getServices(delivery_option);
      return res.json({ services: mockServices });
    }

    // Real Fraktjakt API call (when credentials are configured)
    console.log(`[Fraktjakt] Querying real API...`);

    // Build Fraktjakt XML payload (API v2 format)
    const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 8), 0); // 8kg per tire
    const articleNumber = items[0]?.sku || items[0]?.productId || 'TYRE001';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fraktjakt api_version="2">
  <consignor>
    <id>${FRAKTJAKT_ID}</id>
    <key>${FRAKTJAKT_KEY}</key>
  </consignor>
  <shipment>
    <address_from>${SHOP_ORIGIN_STREET}</address_from>
    <zipcode_from>${SHOP_ORIGIN_POSTAL}</zipcode_from>
    <city_from>${SHOP_ORIGIN_CITY}</city_from>
    <country_from>SE</country_from>
    <address_to>${address1}</address_to>
    <zipcode_to>${postal_code.replace(/\s/g, '')}</zipcode_to>
    <city_to>${city || ""}</city_to>
    <country_to>SE</country_to>
    <parcels>
      <parcel>
        <weight>${totalWeight}</weight>
        <length>63</length>
        <width>63</width>
        <height>25</height>
      </parcel>
    </parcels>
    <commodities>
      <commodity>
        <description>Tyres</description>
        <code>40112000</code>
        <amount>${items.length}</amount>
        <article_number>${articleNumber}</article_number>
      </commodity>
    </commodities>
  </shipment>
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

    // If no services found, return filtered mock data as fallback
    if (!services || services.length === 0) {
      console.log('[Fraktjakt] No services found, using fallback');
      const mockServices = getServices(delivery_option);
      return res.json({ services: mockServices });
    }

    // Filter real API services based on delivery option
    let filteredServices = services;
    if (delivery_option === '0') {
      // Local pickup - only DHL and Schenker
      filteredServices = services.filter(service => {
        const carrierLower = (service.carrier || '').toLowerCase();
        return carrierLower.includes('dhl') || carrierLower.includes('schenker');
      });
      console.log(`[Fraktjakt] Filtered to ${filteredServices.length} services for local pickup`);

      // If no matching services, use mock data
      if (filteredServices.length === 0) {
        console.log('[Fraktjakt] No matching services for local pickup, using mock data');
        return res.json({ services: getServices(delivery_option) });
      }
    }

    res.json({ services: filteredServices });
  } catch (err) {
    console.error("[Fraktjakt] Error:", err.message);
    // Return filtered fallback on error to keep checkout working
    const delivery_option = req.body?.delivery_option || '1';
    const mockServices = getServices(delivery_option);
    res.status(200).json({ services: mockServices });
  }
}
