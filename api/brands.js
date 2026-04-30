// Fetch tire brands list
const EONTYRE_API = process.env.EONTYRE_API_URL || 'https://p511.eontyre.com';
const API_KEY = process.env.EONTYRE_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch(`${EONTYRE_API}/webshop/brands`, {
      headers: { 'Api-Key': API_KEY }
    });

    if (!response.ok) {
      throw new Error(`Brands fetch failed: ${response.status}`);
    }

    const data = await response.json();
    const brands = Array.isArray(data) ? data : data.brands || data.data || [];

    res.json({
      brands: brands.map(b => ({
        id: b.id,
        name: b.name,
        logo: b.logo_url || b.logo
      }))
    });
  } catch (err) {
    console.error('Brands fetch error:', err);
    res.status(500).json({ error: err.message });
  }
}
