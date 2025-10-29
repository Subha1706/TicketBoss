// src/seed.js
require('dotenv').config();
const { connect } = require('./config/mongoose'); // <- use connect()
const Event = require('./models/Event');

async function seed() {
  try {
    // connect to MongoDB
    await connect(); // <-- call connect()

    // read event configuration from .env or fallback defaults
    const eventId = process.env.EVENT_ID || 'node-meetup-2025';
    const totalSeats = Number(process.env.TOTAL_SEATS || 500);

    // upsert event (create if not exists, update if already exists)
    const eventData = {
      eventId,
      name: 'Node.js Meet-up',
      totalSeats,
      availableSeats: totalSeats,
      version: 0
    };

    const event = await Event.findOneAndUpdate(
      { eventId },
      eventData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('\n✅ Database seeded successfully!');
    console.log('Event details:');
    console.log({
      eventId: event.eventId,
      name: event.name,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      version: event.version
    });

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
