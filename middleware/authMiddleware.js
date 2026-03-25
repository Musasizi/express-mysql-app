/**
 * middleware/authMiddleware.js – JWT Authentication Guard
 *
 * KEY CONCEPT – Middleware
 * A middleware function receives (req, res, next).
 *   • If the request is valid  → call next() to pass control to the next handler.
 *   • If the request is invalid → call res.json() to respond immediately and
 *     stop the chain (do NOT call next()).
 *
 * KEY CONCEPT – Bearer Token (Authorization header)
 * When the client has a JWT it sends it in every protected request:
 *   Authorization: Bearer <token>
 *
 * This middleware:
 *  1. Reads that header
 *  2. Extracts the token (the part after "Bearer ")
 *  3. Verifies it with the secret key
 *  4. Attaches the decoded payload to req.user so controllers can read it
 */

const jwt    = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * authenticateToken – Express middleware that protects a route.
 *
 * Usage in a route file:
 *   router.get('/protected', authenticateToken, myController);
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticateToken = (req, res, next) => {
  // Step 1 – Read the Authorization header
  const authHeader = req.headers['authorization'];

  // Step 2 – The header format is "Bearer <token>"; extract only the token part.
  // The optional-chaining operator (?.) safely handles a missing header.
  const token = authHeader?.split(' ')[1];

  // Step 3 – If no token was provided, reject immediately with 401 Unauthorized.
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Step 4 – Verify the token's signature and expiry using our secret key.
  // jwt.verify() throws / calls back with an error if the token is invalid.
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // 403 Forbidden – the client sent a token but it is invalid or expired.
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    // Step 5 – Attach the decoded payload (e.g. { id, username }) to the request
    // object so the next controller can access it via req.user.
    req.user = decoded;
    next();
  });
};

module.exports = authenticateToken;
