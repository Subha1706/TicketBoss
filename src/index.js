// src/index.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const { connect } = require('./config/mongoose');
const EventModel = require('./models/Event');
const eventRoutes = require('./routes/eventRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const EVENT_ID = process.env.EVENT_ID || 'node-meetup-2025';
const EVENT_NAME = process.env.EVENT_NAME || 'Node.js Meet-up';
const TOTAL_SEATS = Number(process.env.TOTAL_SEATS || 500);

app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/event', eventRoutes);
app.use('/reservations', reservationRoutes);

// brief root
app.get('/', (req, res) => {
  res.json({
    service: 'TicketBoss (structured)',
    routes: ['/event', '/reservations']
  });
});

// error handler
app.use((err, req, res, next) => {
  console.error('Unhandled err:', err);
  res.status(500).json({ error: 'internal error' });
});

async function bootstrap() {
  try {
    await connect();
    await EventModel.findOneAndUpdate(
      { eventId: EVENT_ID },
      {
        $set: { name: EVENT_NAME, totalSeats: TOTAL_SEATS },
        $setOnInsert: {
          availableSeats: TOTAL_SEATS,
          version: 0
        }
      },
      { upsert: true, new: true }
    );
    app.listen(PORT, () => {
      console.log('Connected to MongoDB');
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to bootstrap application:', err);
    process.exit(1);
  }
}

bootstrap();
