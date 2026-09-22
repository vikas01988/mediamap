# Cinewave

Production-oriented MERN movie ticket booking foundation with atomic seat locking, Socket.IO updates, Razorpay-ready payments, and a responsive React/Vite client.

## Requirements

- Node.js 20+
- MongoDB Atlas connection string
- Razorpay, Cloudinary, and SMTP credentials for live integrations

## Setup

1. Copy `server/.env.example` to `server/.env` and fill in MongoDB/JWT values.
2. Copy `client/.env.example` to `client/.env`.
3. Run `npm install` at the root, then `npm run install:all`.
4. Start both apps with `npm run dev`.

The API runs on `http://localhost:5000`; Vite runs on `http://localhost:5173`.

## MongoDB Compass

MongoDB Community runs as a Windows service on the default local port. In Compass, connect with:

`mongodb://127.0.0.1:27017`

The application database is `cinewave`. The development server uses the same URI from `server/.env`, so users and bookings persist across restarts.

The demo seed endpoint is intentionally not exposed. Create an admin through the database or a protected provisioning script before managing catalog data.

## Architecture

- `server/src/models`: MongoDB documents and indexes
- `server/src/services`: booking and payment domain logic
- `server/src/routes`: versioned HTTP API
- `server/src/socket`: real-time show room events
- `client/src/pages`: route-level screens
- `client/src/redux`: auth, catalog, and booking state

## Production checklist

Use managed MongoDB, HTTPS, a real object-storage configuration, Razorpay webhook verification, a durable job runner for cleanup, structured logs, backups, and a secret manager before launch.
