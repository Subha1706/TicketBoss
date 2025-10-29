# 🎟️ TicketBoss – Event Ticket Reservation API

TicketBoss is a lightweight RESTful API for managing event ticket reservations.  
It allows event partners to **create, list, and cancel reservations** while maintaining accurate seat availability using **MongoDB Atlas** as the database.

Built with **Node.js**, **Express.js**, and **Mongoose**, this project demonstrates clean architecture, proper validation, error handling, and concurrency-safe seat updates.

---

## 🚀 Tech Stack

- **Backend Framework:** Node.js (Express.js)
- **Database:** MongoDB Atlas (via Mongoose)
- **Environment Variables:** dotenv
- **Logging:** Morgan
- **Unique IDs:** UUID
- **Deployment-Ready:** Works with any cloud MongoDB instance

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/TicketBoss.git
cd TicketBoss
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in your project root and add:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ticketboss
EVENT_ID=node-meetup-2025
TOTAL_SEATS=500
MAX_PER_REQUEST=10
```
> ⚠️ Replace `<username>` and `<password>` with your MongoDB Atlas credentials.

### 4️⃣ Seed the Database
Seeds your database with a default event.
```bash
npm run seed
```

### 5️⃣ Start the Server
```bash
npm start
```
Expected output:
```
Connected to MongoDB
Server listening on http://localhost:3000
```

---

## 🧪 Testing the API

You can use **curl**, **Postman**, or **Insomnia**.

### 🟩 Get Event Summary
```bash
curl -X GET http://localhost:3000/event
```
**Response:**
```json
{
  "event": {
    "eventId": "node-meetup-2025",
    "name": "Node.js Meet-up",
    "totalSeats": 500,
    "availableSeats": 500,
    "version": 0
  },
  "reservationCount": 0
}
```

---

### 🟨 Create a New Reservation
```bash
curl -X POST http://localhost:3000/reservations \
-H "Content-Type: application/json" \
-d '{"partnerId":"partner-1","seats":5}'
```
**Response:**
```json
{
  "reservation": {
    "reservationId": "abc123",
    "partnerId": "partner-1",
    "seats": 5,
    "status": "confirmed"
  },
  "event": {
    "availableSeats": 495,
    "version": 1
  }
}
```

---

### 🟦 List All Reservations
```bash
curl -X GET http://localhost:3000/reservations
```
**Response:**
```json
{
  "reservations": [
    {
      "reservationId": "abc123",
      "partnerId": "partner-1",
      "seats": 5,
      "status": "confirmed"
    }
  ]
}
```

---

### 🟥 Cancel a Reservation
```bash
curl -X POST http://localhost:3000/reservations/<reservationId>/cancel
```
**Response:**
```json
{
  "message": "cancelled",
  "reservation": {
    "reservationId": "abc123",
    "status": "cancelled"
  },
  "event": {
    "availableSeats": 500,
    "version": 2
  }
}
```
> ⚠️ Replace `<reservationId>` with a real ID from the create response.

---

## 📁 Project Structure

```
.
├── .env
├── package.json
├── package-lock.json
├── README.md
└── src
    ├── index.js
    ├── seed.js
    ├── config
    │   └── db.js
    ├── controllers
    │   ├── eventController.js
    │   └── reservationController.js
    ├── models
    │   ├── Event.js
    │   └── Reservation.js
    └── routes
        ├── eventRoutes.js
        └── reservationRoutes.js
```

---

## 🔍 API Endpoints Overview

| Method | Endpoint | Description | Request Body | Response |
|:------:|:----------|:-------------|:--------------|:-----------|
| **GET** | `/event` | Get event details & available seats | — | Event info |
| **GET** | `/reservations` | Get all reservations | — | Reservation list |
| **POST** | `/reservations` | Create new reservation | `{ "partnerId": "p1", "seats": 5 }` | Reservation + updated event |
| **POST** | `/reservations/:id/cancel` | Cancel reservation | — | Cancelled reservation + updated event |

---

## 🧠 Technical Overview

### Architecture
- **Express.js** for routing and middleware
- **Mongoose** for MongoDB connection & schema validation
- **dotenv** for environment configuration
- **Morgan** for HTTP logging
- **Atomic Updates** to prevent overbooking

### Data Models

#### Event
```js
{
  eventId: String,
  name: String,
  totalSeats: Number,
  availableSeats: Number,
  version: Number
}
```

#### Reservation
```js
{
  reservationId: String,
  partnerId: String,
  seats: Number,
  status: "confirmed" | "cancelled",
  createdAt: Date,
  cancelledAt: Date
}
```

---

## ⚖️ Validation & Error Handling

- Validates `partnerId` (required string).
- Validates `seats` (integer > 0 and ≤ MAX_PER_REQUEST).
- Returns correct HTTP status codes:
  - **400** → Invalid input
  - **404** → Not found
  - **409** → Seat conflict / Overbooking
  - **500** → Server error
- Centralized error handler in `index.js`.

---

## 🔒 Concurrency Handling

- Uses **MongoDB’s atomic operators**:
  - `findOneAndUpdate` with `$gte` ensures no overbooking.
- Rollback logic if reservation insert fails after seat decrement.
- Prevents race conditions without requiring transactions.

---

## 📈 Future Enhancements

- Add **MongoDB Transactions** (requires replica set) for full atomicity.
- Add **unit/integration tests** (Mocha + Supertest).
- Add **JWT authentication** for partner verification.
- Add **pagination** and filters for large reservation lists.
- Add **rate limiting** & API key access for public APIs.


## 💡 Troubleshooting

| Problem | Possible Fix |
|----------|----------------|
| **Mongo connection fails** | Check your `MONGODB_URI` and IP whitelist in Atlas |
| **`Event already exists` on seed** | The seed script prevents duplicate events; delete the old one from Atlas if needed |
| **`Duplicate index` warnings** | Remove redundant `schema.index()` lines (keep only `unique: true` on field) |
| **Port in use** | Change `PORT` in `.env` |

---

## 🧑‍💻 Author

**Subha**  
*October 2025*

---


