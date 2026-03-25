/**
 * controllers/userController.js – User Management Controller
 *
 * All routes here are protected by the authenticateToken middleware,
 * so req.user is always available and contains { id, username }.
 *
 * REST convention used:
 *   GET    /api/users        → getAllUsers   (list)
 *   GET    /api/users/:id    → getUserById   (single item)
 *   PUT    /api/users/:id    → updateUser    (replace fields)
 *   DELETE /api/users/:id    → deleteUser    (remove)
 */

const User = require('../models/userModel');

/**
 * GET /api/users
 * Return every registered user (passwords excluded by the model).
 */
const getAllUsers = async (req, res) => {
  try {
    const [users] = await User.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/users/:id
 * Return a single user by primary key.
 * Responds with 404 if the user does not exist.
 */
const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const [results] = await User.findById(userId);
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/users/:id
 * Update a user's username and/or email.
 * Body: { username, email }
 */
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email } = req.body;

  // ── Input Validation ───────────────────────────────────────────────────────
  if (!username || !email) {
    return res.status(400).json({ error: 'username and email are required.' });
  }

  try {
    await User.update(userId, username, email);
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username or email already in use.' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/users/:id
 * Permanently remove a user.
 * The database CASCADE rule also removes their chapter enrolments.
 */
const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await User.delete(userId);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
