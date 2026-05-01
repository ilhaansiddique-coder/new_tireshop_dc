// Debug endpoint to see raw EonTyre API response
const EONTYRE_API = process.env.EONTYRE_API_URL || 'https://p511.eontyre.com';
const API_KEY = process.env.EONTYRE_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { width, ratio, diameter } = req.query;

    if (!width || !ratio || !diameter) {
      return res.status(400).json({ error: 'Need width, ratio, diameter' });
    }

    const params = new URLSearchParams({
      version: '2',
      width,
      aspectRatio: ratio,
      diameter,
      typeId: '1',
      searchMode: '4',
      webshopId: '38',
      limit: '100',
      page: '1'
    });

    const url = `${EONTYRE_API}/api/webshop/products?${params}`;
    console.log(`[DEBUG] Fetching: ${url}`);
    console.log(`[DEBUG] API Key configured: ${API_KEY ? 'yes' : 'NO'}`);

    const res1 = await fetch(url, {
      headers: { 'Api-Key': API_KEY }
    });

    console.log(`[DEBUG] Response status: ${res1.status}`);

    const responseText = await res1.text();
    console.log(`[DEBUG] Response length: ${responseText.length}`);
    console.log(`[DEBUG] Response first 500 chars: ${responseText.substring(0, 500)}`);

    try {
      const data = JSON.parse(responseText);
      return res.json({
        status: 'ok',
        rawResponse: data,
        responseType: typeof data,
        isArray: Array.isArray(data),
        keys: Array.isArray(data) ? 'N/A (array)' : Object.keys(data),
        firstItem: Array.isArray(data) ? data[0] : data[Object.keys(data)[0]]?.[0]
      });
    } catch (e) {
      return res.json({
        status: 'error',
        parseError: e.message,
        responseText: responseText.substring(0, 1000)
      });
    }
  } catch (err) {
    console.error('[DEBUG] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
