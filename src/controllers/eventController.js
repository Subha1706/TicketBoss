// src/controllers/eventController.js
const EventModel = require('../models/Event');
const ReservationModel = require('../models/Reservation');

const EVENT_ID = process.env.EVENT_ID || 'node-meetup-2025';

async function getEventSummary(req, res) {
  try {
    const [event, confirmedCount] = await Promise.all([
      EventModel.findOne({ eventId: EVENT_ID }).lean(),
      ReservationModel.countDocuments({ status: 'confirmed' })
    ]);

    if (!event) {
      return res.status(404).json({ error: 'event not configured' });
    }

    res.json({
      event,
      reservationCount: confirmedCount
    });
  } catch (err) {
    console.error('getEventSummary error:', err);
    res.status(500).json({ error: 'failed to read event' });
  }
}

module.exports = {
  getEventSummary
};
