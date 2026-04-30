// Service bookings API (stores in Vercel KV)
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

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
      // Create booking
      const { name, phone, email, plate, service, date, message } = req.body;

      // Validation
      if (!name || !phone || !email || !service || !date) {
        return res.status(400).json({
          error: 'Missing required fields: name, phone, email, service, date'
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
        message: message || '',
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // Store in KV with expiry of 90 days
      await kv.setex(`booking:${bookingId}`, 7776000, JSON.stringify(booking));
      // Also add to a list of all bookings
      await kv.lpush('bookings:list', bookingId);

      res.status(201).json({
        id: bookingId,
        message: 'Booking created successfully',
        booking
      });
    } else if (req.method === 'GET') {
      // Get all bookings (admin only - in production, add auth check)
      const bookingIds = await kv.lrange('bookings:list', 0, -1);
      const bookings = [];

      for (const bookingId of bookingIds) {
        const bookingJson = await kv.get(`booking:${bookingId}`);
        if (bookingJson) {
          bookings.push(JSON.parse(bookingJson));
        }
      }

      res.json({
        count: bookings.length,
        bookings: bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Bookings error:', err);
    res.status(500).json({ error: err.message });
  }
}
