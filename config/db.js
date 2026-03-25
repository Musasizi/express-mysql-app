/**
 * config/db.js – Database connection pool
 *
 * KEY CONCEPT – Connection Pool vs Single Connection
 * A single connection can only run one query at a time.  Under load the
 * second request has to wait.  A *pool* keeps multiple connections open
 * and hands them out as needed, then returns them when the query finishes.
 *
 * mysql2's createPool() does this automatically.
 * We call pool.promise() so we can use modern async/await syntax in our
 * models instead of callback functions.
 */

const mysql  = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create a pool with the credentials stored in .env
// NEVER hard-code passwords or hostnames directly in source code!
const pool = mysql.createPool({
  host:     process.env.DB_HOST,     // e.g. 'localhost'
  user:     process.env.DB_USER,     // e.g. 'root'
  password: process.env.DB_PASSWORD, // keep this secret!
  database: process.env.DB_DATABASE, // e.g. 'academia_db'
  port:     process.env.DB_PORT || 3306,
  waitForConnections: true,  // queue requests instead of throwing instantly
  connectionLimit:    10,    // max simultaneous connections in the pool
  queueLimit:         0,     // 0 = unlimited queue
});

// Test the connection eagerly so we know at startup if the DB is unreachable.
pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1); // Exit so the problem is obvious, not hidden
  }
  console.log('MySQL connected');
  connection.release(); // Always release a borrowed connection back to the pool!
});

// Export the promise-based version so models can do:
//   const [rows] = await db.query(sql, params);
module.exports = pool.promise();
