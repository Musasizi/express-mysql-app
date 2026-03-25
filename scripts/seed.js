const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function seed() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
    });

    console.log('Connected to database. Running seed...\n');

    // ── Schema ─────────────────────────────────────────────────────────────────

    await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      username    VARCHAR(100) NOT NULL UNIQUE,
      email       VARCHAR(150) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log('✔  Table: users');

    await db.execute(`
    CREATE TABLE IF NOT EXISTS chapters (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      name         VARCHAR(150) NOT NULL,
      description  TEXT,
      chapter_type ENUM('lecture','lab','tutorial','seminar','workshop') DEFAULT 'lecture',
      status       ENUM('active','archived') DEFAULT 'active',
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Add new columns if they don't exist yet (idempotent re-runs)
    await db.execute(`
      ALTER TABLE chapters
        ADD COLUMN IF NOT EXISTS chapter_type ENUM('lecture','lab','tutorial','seminar','workshop') DEFAULT 'lecture',
        ADD COLUMN IF NOT EXISTS status ENUM('active','archived') DEFAULT 'active'
    `).catch(() => { }); // Silently skip if columns already exist
    console.log('✔  Table: chapters (with chapter_type + status)');

    await db.execute(`
    CREATE TABLE IF NOT EXISTS user_chapters (
      user_id     INT NOT NULL,
      chapter_id  INT NOT NULL,
      PRIMARY KEY (user_id, chapter_id),
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    )
  `);
    console.log('✔  Table: user_chapters\n');

    // ── Seed users ─────────────────────────────────────────────────────────────

    const users = [
        { username: 'alice', email: 'alice@example.com', password: 'password123' },
        { username: 'bob', email: 'bob@example.com', password: 'password123' },
        { username: 'charlie', email: 'charlie@example.com', password: 'password123' },
        { username: 'diana', email: 'diana@example.com', password: 'password123' },
    ];

    for (const u of users) {
        const hash = await bcrypt.hash(u.password, 10);
        await db.execute(
            'INSERT IGNORE INTO users (username, email, password) VALUES (?, ?, ?)',
            [u.username, u.email, hash]
        );
    }
    console.log(`✔  Seeded ${users.length} users`);

    // ── Seed chapters ───────────────────────────────────────────────────────────

    const chapters = [
        { name: 'Introduction to Node.js', description: 'Fundamentals of Node.js runtime, event loop, and modules.', chapter_type: 'lecture', status: 'active' },
        { name: 'Express.js Basics', description: 'Building RESTful APIs with Express – routing, middleware, and error handling.', chapter_type: 'lecture', status: 'active' },
        { name: 'MySQL & Relational DBs', description: 'Database design, SQL queries, joins, and transactions.', chapter_type: 'lab', status: 'active' },
        { name: 'Authentication & JWT', description: 'User auth with bcrypt password hashing and JSON Web Tokens.', chapter_type: 'tutorial', status: 'active' },
        { name: 'Deployment & DevOps', description: 'Containerising apps with Docker and deploying to cloud platforms.', chapter_type: 'workshop', status: 'active' },
        { name: 'React Fundamentals', description: 'Components, props, state, and hooks in React 19.', chapter_type: 'lecture', status: 'active' },
        { name: 'REST API Design', description: 'Best practices for designing clean and scalable REST APIs.', chapter_type: 'seminar', status: 'active' },
        { name: 'SQL Lab: Joins & Indexes', description: 'Hands-on SQL exercises covering joins, sub-queries and indexing.', chapter_type: 'lab', status: 'archived' },
    ];

    for (const c of chapters) {
        await db.execute(
            'INSERT IGNORE INTO chapters (name, description, chapter_type, status) VALUES (?, ?, ?, ?)',
            [c.name, c.description, c.chapter_type, c.status]
        );
    }
    console.log(`✔  Seeded ${chapters.length} chapters`);

    // ── Assign users to chapters ────────────────────────────────────────────────

    const [allUsers] = await db.execute('SELECT id FROM users    ORDER BY id');
    const [allChapters] = await db.execute('SELECT id FROM chapters ORDER BY id');

    // alice  → chapters 1, 2, 3
    // bob    → chapters 2, 4
    // charlie → chapters 1, 3, 5
    // diana  → all chapters
    const assignments = [
        [0, 0], [0, 1], [0, 2],
        [1, 1], [1, 3],
        [2, 0], [2, 2], [2, 4],
        [3, 0], [3, 1], [3, 2], [3, 3], [3, 4],
    ];

    let assigned = 0;
    for (const [ui, ci] of assignments) {
        if (allUsers[ui] && allChapters[ci]) {
            await db.execute(
                'INSERT IGNORE INTO user_chapters (user_id, chapter_id) VALUES (?, ?)',
                [allUsers[ui].id, allChapters[ci].id]
            );
            assigned++;
        }
    }
    console.log(`✔  Assigned users to chapters (${assigned} memberships)\n`);

    console.log('Seed complete! You can log in with any seeded user:');
    console.log('  username: alice | bob | charlie | diana');
    console.log('  password: password123');

    await db.end();
}

seed().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
