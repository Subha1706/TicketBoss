// src/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true }, // unique here is enough
    name: { type: String, required: true },
    totalSeats: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, required: true, min: 0 },
    version: { type: Number, default: 0, min: 0 }
  },
  {
    collection: 'events',
    timestamps: true
  }
);

module.exports = mongoose.model('Event', eventSchema);
