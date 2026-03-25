/**
 * routes/authRoutes.js – Authentication Routes
 *
 * These routes are PUBLIC – no token required.
 *
 * KEY CONCEPT – Express Router
 * express.Router() creates a mini-app that handles only its own routes.
 * We mount it in server.js with app.use('/api', authRoutes), so:
 *   router.post('/register')  becomes  POST /api/register
 *   router.post('/login')     becomes  POST /api/login
 */

const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// POST /api/register – Create a new user account
router.post('/register', register);

// POST /api/login – Authenticate and receive a JWT
router.post('/login', login);

module.exports = router;
