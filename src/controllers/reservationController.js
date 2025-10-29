// src/controllers/reservationController.js
const { v4: uuidv4 } = require('uuid');
const EventModel = require('../models/Event');
const ReservationModel = require('../models/Reservation');

const MAX_PER_REQUEST = Number(process.env.MAX_PER_REQUEST || 10);
const EVENT_ID = process.env.EVENT_ID || 'node-meetup-2025';

/**
 * create reservation against the configured event
 * body: { partnerId: string, seats: number }
 */
async function createReservation(req, res) {
  const { partnerId, seats } = req.body || {};
  if (!partnerId || typeof partnerId !== 'string') {
    return res.status(400).json({ error: 'partnerId is required (string)' });
  }
  const seatsNum = Number(seats);
  if (!Number.isInteger(seatsNum) || seatsNum <= 0 || seatsNum > MAX_PER_REQUEST) {
    return res.status(400).json({ error: `seats must be an integer >0 and <= ${MAX_PER_REQUEST}` });
  }

  const reservationId = uuidv4();
  let eventAfterUpdate = null;

  try {
    eventAfterUpdate = await EventModel.findOneAndUpdate(
      { eventId: EVENT_ID, availableSeats: { $gte: seatsNum } },
      { $inc: { availableSeats: -seatsNum, version: 1 } },
      { new: true }
    ).lean();

    if (!eventAfterUpdate) {
      return res.status(409).json({ error: 'Not enough seats available' });
    }

    const reservationDoc = await ReservationModel.create({
      reservationId,
      partnerId,
      seats: seatsNum
    });

    return res.status(201).json({
      reservation: reservationDoc.toObject(),
      event: eventAfterUpdate
    });
  } catch (err) {
    if (eventAfterUpdate) {
      try {
        await EventModel.updateOne(
          { eventId: EVENT_ID },
          { $inc: { availableSeats: seatsNum, version: 1 } }
        );
      } catch (rollbackErr) {
        console.error('createReservation rollback failed:', rollbackErr);
      }
    }
    console.error('createReservation error:', err);
    return res.status(500).json({ error: 'failed to create reservation' });
  }
}

/** list reservations */
async function listReservations(req, res) {
  try {
    const reservations = await ReservationModel.find().sort({ createdAt: -1 }).lean();
    res.json({ reservations });
  } catch (err) {
    console.error('listReservations error:', err);
    res.status(500).json({ error: 'failed to list reservations' });
  }
}

/** cancel reservation (id param) */
async function cancelReservation(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'reservation id required' });

  try {
    const reservation = await ReservationModel.findOne({ reservationId: id }).lean();
    if (!reservation) return res.status(404).json({ error: 'reservation not found' });
    if (reservation.status === 'cancelled') return res.status(400).json({ error: 'already cancelled' });

    const cancelledReservation = await ReservationModel.findOneAndUpdate(
      { reservationId: id, status: 'confirmed' },
      { status: 'cancelled', cancelledAt: new Date() },
      { new: true }
    ).lean();

    if (!cancelledReservation) {
      return res.status(400).json({ error: 'reservation already processed' });
    }

    const eventAfterUpdate = await EventModel.findOneAndUpdate(
      { eventId: EVENT_ID },
      { $inc: { availableSeats: reservation.seats, version: 1 } },
      { new: true }
    ).lean();

    if (!eventAfterUpdate) {
      return res.status(500).json({ error: 'event not configured' });
    }

    return res.json({
      message: 'cancelled',
      reservation: cancelledReservation,
      event: eventAfterUpdate
    });
  } catch (err) {
    console.error('cancelReservation error:', err);
    return res.status(500).json({ error: 'failed to cancel reservation' });
  }
}

module.exports = {
  createReservation,
  listReservations,
  cancelReservation
};
