// Proxy orders API (create and retrieve)
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
    if (req.method === 'POST') {
      // Create order
      const orderData = req.body;

      const response = await fetch(`${EONTYRE_API}/api/v2/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': API_KEY
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Order creation failed:', errorText);
        throw new Error(`Order creation failed: ${response.status}`);
      }

      const data = await response.json();
      res.status(201).json(data);
    } else if (req.method === 'GET') {
      // Retrieve order by ID
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Order ID required' });
      }

      const response = await fetch(`${EONTYRE_API}/api/v2/orders/${id}`, {
        headers: { 'Api-Key': API_KEY }
      });

      if (!response.ok) {
        throw new Error(`Order fetch failed: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Orders error:', err);
    res.status(500).json({ error: err.message });
  }
}
