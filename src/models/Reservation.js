// src/models/Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    reservationId: { type: String, required: true, unique: true },
    partnerId: { type: String, required: true },
    seats: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    createdAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date, default: null }
  },
  {
    collection: 'reservations',
    timestamps: true
  }
);


module.exports = mongoose.model('Reservation', reservationSchema);
