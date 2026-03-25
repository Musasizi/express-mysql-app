/**
 * models/userModel.js – Data Access Layer for Users
 *
 * KEY CONCEPT – Model / Data Access Layer
 * The model is the only place in the application that talks to the database.
 * Controllers call model methods; they never write SQL themselves.
 * This separation makes it easy to swap databases later (e.g. MySQL → PostgreSQL).
 *
 * KEY CONCEPT – Parameterised Queries (? placeholders)
 * We NEVER build SQL strings by concatenating user input.
 * Bad:  `SELECT * FROM users WHERE id = ${id}`  ← SQL injection risk!
 * Good: `SELECT * FROM users WHERE id = ?`  with  [id]  as the second argument.
 * mysql2 escapes the values safely before sending the query to MySQL.
 *
 * KEY CONCEPT – async/await with mysql2 pool
 * db.query() returns a Promise that resolves to [rows, fields].
 * We destructure it: const [rows] = await db.query(...)
 */

const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  /**
   * Create a new user.
   * The password is hashed with bcrypt before storing – NEVER store plain text!
   * bcrypt.hash(password, 10) uses a "salt rounds" value of 10.
   * Higher = slower to crack but also slower to compute.
   */
  create: async (username, password, email) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    return db.query(sql, [username, hashedPassword, email]);
  },

  /**
   * Look up a user by username (used during login).
   * Returns the full row including the hashed password so we can compare it.
   */
  findByUsername: (username) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    return db.query(sql, [username]);
  },

  /**
   * Look up a single user by their primary key.
   * Used in the GET /users/:id route.
   * We exclude the password from the result for security.
   */
  findById: (id) => {
    const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    return db.query(sql, [id]);
  },

  /**
   * Return all users (password excluded for security).
   */
  getAll: () => {
    const sql = 'SELECT id, username, email, created_at FROM users';
    return db.query(sql);
  },

  /**
   * Update a user's username and email.
   * id is the WHERE condition so we only change one row.
   */
  update: (id, username, email) => {
    const sql = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
    return db.query(sql, [username, email, id]);
  },

  /**
   * Permanently delete a user by id.
   * The user_chapters join-table rows are removed automatically via
   * the ON DELETE CASCADE foreign key constraint in the schema.
   */
  delete: (id) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    return db.query(sql, [id]);
  },
};

module.exports = User;
