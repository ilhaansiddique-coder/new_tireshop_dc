// Lookup car by license plate
const EONTYRE_API = process.env.EONTYRE_API_URL || 'https://p511.eontyre.com';
const API_KEY = process.env.EONTYRE_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plate } = req.body;

    if (!plate) {
      return res.status(400).json({ error: 'Plate required' });
    }

    const cleanPlate = plate.replace(/[^A-Z0-9]/g, '').toUpperCase();

    const response = await fetch(`${EONTYRE_API}/api/webshop/cars/${cleanPlate}`, {
      method: 'POST',
      headers: { 'Api-Key': API_KEY }
    });

    if (!response.ok) {
      throw new Error(`Car lookup failed: ${response.status}`);
    }

    const data = await response.json();

    const car = data.car || data;
    const vrd = car.vehicle_registration_data;

    res.json({
      make: vrd?.make,
      model: vrd?.model,
      year: vrd?.year,
      tireDimension: vrd?.tire_dimension,
      tireWidth: vrd?.tire_width,
      tireAspectRatio: vrd?.tire_aspect_ratio,
      tireDiameter: vrd?.tire_diameter,
      tireSeasonType: vrd?.tire_season_type
    });
  } catch (err) {
    console.error('Vehicle lookup error:', err);
    res.status(500).json({ error: err.message });
  }
}
