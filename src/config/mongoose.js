// src/config/mongoose.js
const mongoose = require('mongoose');

let initializing = null;

async function connect() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (initializing) {
    return initializing;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment');
  }

  mongoose.set('strictQuery', true);

  initializing = mongoose
    .connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
      serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS || 10000)
    })
    .then(() => mongoose.connection)
    .finally(() => {
      initializing = null;
    });

  return initializing;
}

module.exports = {
  connect
};
