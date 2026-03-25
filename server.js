/**
 * server.js – Application entry point
 *
 * This file:
 *  1. Creates the Express app
 *  2. Attaches global middleware (JSON body parser, CORS)
 *  3. Mounts route groups under /api
 *  4. Starts the HTTP server
 *
 * KEY CONCEPT – Middleware
 * Middleware functions run BEFORE your route handlers.  Express processes
 * them in the order they are registered with app.use().
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from the .env file into process.env
dotenv.config();

// Import the three route groups (each is its own Express Router)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chapterRoutes = require('./routes/chapterRoutes');

// ─── Create Express Application ──────────────────────────────────────────────
const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

// Parse incoming JSON request bodies automatically so controllers can read
// req.body as a plain JavaScript object.
app.use(express.json());

// Allow requests from other origins (e.g. the React dev server on port 5173).
// In production you would whitelist specific origins instead of '*'.
app.use(cors());

// ─── Health-Check Route ───────────────────────────────────────────────────────
// A simple GET / that lets you quickly verify the server is alive.
// Try: curl http://localhost:3000/
app.get('/', (req, res) => {
  res.json({ message: 'Academia API is running 🚀', status: 'ok' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
// All routes are prefixed with /api to namespace them away from other paths.
//
//  /api/register  POST  → authRoutes
//  /api/login     POST  → authRoutes
//  /api/users     GET / PUT / DELETE  → userRoutes   (protected)
//  /api/chapters  GET / POST / PUT / DELETE → chapterRoutes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', chapterRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Any request that does not match a registered route falls through to here.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Express recognises a function with FOUR parameters as an error handler.
// Call next(err) from any middleware/controller to land here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
