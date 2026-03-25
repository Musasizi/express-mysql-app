/**
 * controllers/authController.js – Authentication Controller
 *
 * KEY CONCEPT – Controller Responsibility
 * Controllers sit between the route and the model.
 *  • They validate & parse the incoming request (req.body, req.params)
 *  • They call one or more model methods to read/write the database
 *  • They build and send the HTTP response
 *
 * KEY CONCEPT – Password Hashing (bcrypt)
 * Passwords must NEVER be stored as plain text.
 * bcrypt hashes the password into a one-way digest.
 * During login we use bcrypt.compare() to check the attempt against the hash.
 *
 * KEY CONCEPT – JWT (JSON Web Token)
 * After a successful login we sign a token that encodes the user's id and
 * username.  The client sends this token in the Authorization header of every
 * subsequent request.  The server verifies the signature with JWT_SECRET.
 */

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * POST /api/register
 * Create a new user account.
 * Body: { username, password, email }
 */
const register = async (req, res) => {
  const { username, password, email } = req.body;

  // ── Input Validation ───────────────────────────────────────────────────────
  // Always validate before touching the database.
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'username, password and email are required.' });
  }

  try {
    // The User model hashes the password before inserting (see userModel.js)
    await User.create(username, password, email);
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    // MySQL error code ER_DUP_ENTRY means username or email already exists.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username or email already in use.' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/login
 * Authenticate a user and return a JWT.
 * Body: { username, password }
 * Response: { token, user: { id, username, email } }
 */
const login = async (req, res) => {
  const { username, password } = req.body;

  // ── Input Validation ───────────────────────────────────────────────────────
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required.' });
  }

  try {
    // Step 1 – Find the user in the database
    const [results] = await User.findByUsername(username);
    if (results.length === 0) {
      // Use a generic message – don't tell attackers which field was wrong.
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = results[0];

    // Step 2 – Compare the submitted password with the stored bcrypt hash
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Step 3 – Sign a JWT with a 24-hour expiry
    // The payload ({ id, username }) is readable by anyone, so don't put
    // sensitive data (like passwords) in it.
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Step 4 – Return the token plus safe user info (no password!)
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };
