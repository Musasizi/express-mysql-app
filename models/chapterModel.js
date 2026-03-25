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
  create: (name, description) => {
    const sql = 'INSERT INTO chapters (name, description) VALUES (?, ?)';
    return db.query(sql, [name, description]);
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
   * Update a chapter's name and description.
   */
  update: (id, name, description) => {
    const sql = 'UPDATE chapters SET name = ?, description = ? WHERE id = ?';
    return db.query(sql, [name, description, id]);
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
