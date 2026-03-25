/**
 * routes/userRoutes.js – User Management Routes
 *
 * All routes here are PROTECTED – the client must include a valid JWT in the
 * Authorization header:  Authorization: Bearer <token>
 *
 * The authenticateToken middleware is applied as the second argument to each
 * route; it runs before the controller function.
 *
 * Route map:
 *   GET    /api/users        → list all users
 *   GET    /api/users/:id    → get one user by id
 *   PUT    /api/users/:id    → update username / email
 *   DELETE /api/users/:id    → delete a user
 */

const express             = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const authenticateToken   = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users
router.get('/users', authenticateToken, getAllUsers);

// GET /api/users/:id
router.get('/users/:id', authenticateToken, getUserById);

// PUT /api/users/:id
router.put('/users/:id', authenticateToken, updateUser);

// DELETE /api/users/:id
router.delete('/users/:id', authenticateToken, deleteUser);

module.exports = router;
