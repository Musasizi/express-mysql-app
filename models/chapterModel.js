/**
 * models/chapterModel.js – Data Access Layer for Chapters
 *
 * KEY CONCEPT – JOIN queries
 * getUsersInChapter uses a JOIN to combine data from two tables.
 * The user_chapters table is a *junction table* (also called a bridge or
 * associative table) that represents the many-to-many relationship:
 *   one chapter can have many users, one user can belong to many chapters.
 *
 * SQL JOIN reminder:
 *   SELECT <columns>
 *   FROM <left table>
 *   JOIN <right table> ON <left table>.<fk> = <right table>.<pk>
 *   WHERE <condition>
 */

const db = require('../config/db');

const Chapter = {
  /**
   * Insert a new chapter row.
   */
  create: (name, description, chapter_type, status) => {
    const sql = 'INSERT INTO chapters (name, description, chapter_type, status) VALUES (?, ?, ?, ?)';
    return db.query(sql, [name, description, chapter_type || 'lecture', status || 'active']);
  },

  /**
   * Return every chapter (newest first via ORDER BY).
   */
  getAll: () => {
    const sql = 'SELECT * FROM chapters ORDER BY created_at DESC';
    return db.query(sql);
  },

  /**
   * Return a single chapter by its primary key.
   */
  getById: (id) => {
    const sql = 'SELECT * FROM chapters WHERE id = ?';
    return db.query(sql, [id]);
  },

  /**
   * Update a chapter's name, description, type and status.
   */
  update: (id, name, description, chapter_type, status) => {
    const sql = 'UPDATE chapters SET name = ?, description = ?, chapter_type = ?, status = ? WHERE id = ?';
    return db.query(sql, [name, description, chapter_type || 'lecture', status || 'active', id]);
  },

  /**
   * Delete a chapter.
   * Rows in user_chapters are removed via ON DELETE CASCADE.
   */
  delete: (id) => {
    const sql = 'DELETE FROM chapters WHERE id = ?';
    return db.query(sql, [id]);
  },

  /**
   * Return aggregate stats for the dashboard:
   *   - count per chapter_type
   *   - count per status
   *   - total enrolments
   *   - recent chapters (last 5)
   */
  getStats: async () => {
    const [byType] = await db.query('SELECT chapter_type, COUNT(*) AS count FROM chapters GROUP BY chapter_type');
    const [byStatus] = await db.query('SELECT status, COUNT(*) AS count FROM chapters GROUP BY status');
    const [[{ total: totalEnrolments }]] = await db.query('SELECT COUNT(*) AS total FROM user_chapters');
    // Per-chapter enrolment counts — used for bar chart in Reports
    const [enrolmentsPerChapter] = await db.query(`
      SELECT c.name, COUNT(uc.user_id) AS enrolled
      FROM   chapters c
      LEFT JOIN user_chapters uc ON uc.chapter_id = c.id
      GROUP BY c.id, c.name
      ORDER BY enrolled DESC
    `);
    const [recent] = await db.query('SELECT id, name, chapter_type, status, created_at FROM chapters ORDER BY created_at DESC LIMIT 5');
    const [[{ total: chapterTotal }]] = await db.query('SELECT COUNT(*) AS total FROM chapters');
    const [[{ total: userTotal }]] = await db.query('SELECT COUNT(*) AS total FROM users');
    return { byType, byStatus, enrolments: totalEnrolments, enrolmentsPerChapter, recent, chapterTotal, userTotal };
  },

  /**
   * Add a user to a chapter (insert into the junction table).
   * The PRIMARY KEY (user_id, chapter_id) prevents duplicate enrolments.
   */
  addUserToChapter: (userId, chapterId) => {
    const sql = 'INSERT INTO user_chapters (user_id, chapter_id) VALUES (?, ?)';
    return db.query(sql, [userId, chapterId]);
  },

  /**
   * Return all users enrolled in a chapter.
   * Uses a JOIN across three tables: users ↔ user_chapters ↔ chapters.
   */
  getUsersInChapter: (chapterId) => {
    const sql = `
      SELECT users.id, users.username, users.email
      FROM   users
      JOIN   user_chapters ON users.id = user_chapters.user_id
      WHERE  user_chapters.chapter_id = ?
    `;
    return db.query(sql, [chapterId]);
  },
};

module.exports = Chapter;
