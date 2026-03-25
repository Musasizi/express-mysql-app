/**
 * controllers/chapterController.js – Chapter Management Controller
 *
 * REST convention used:
 *   GET    /api/chapters              → getAllChapters   (public)
 *   GET    /api/chapters/:id          → getChapterById   (public)
 *   POST   /api/chapters              → createChapter    (protected)
 *   PUT    /api/chapters/:id          → updateChapter    (protected)
 *   DELETE /api/chapters/:id          → deleteChapter    (protected)
 *   POST   /api/chapters/add-user     → addUserToChapter (protected)
 *   GET    /api/chapters/:id/users    → getUsersInChapter (protected)
 */

const Chapter = require('../models/chapterModel');

/**
 * POST /api/chapters
 * Create a new chapter.
 * Body: { name, description, chapter_type, status }
 */
const createChapter = async (req, res) => {
  const { name, description, chapter_type, status } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Chapter name is required.' });
  }

  try {
    const [result] = await Chapter.create(name, description || '', chapter_type, status);
    res.status(201).json({
      message: 'Chapter created successfully.',
      chapterId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/chapters
 * Return all chapters. No authentication required (public read).
 */
const getAllChapters = async (req, res) => {
  try {
    const [chapters] = await Chapter.getAll();
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/chapters/:id
 * Return a single chapter by primary key.
 */
const getChapterById = async (req, res) => {
  const chapterId = req.params.id;
  try {
    const [results] = await Chapter.getById(chapterId);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Chapter not found.' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/chapters/:id
 * Update a chapter's name, description, type and status.
 * Body: { name, description, chapter_type, status }
 */
const updateChapter = async (req, res) => {
  const chapterId = req.params.id;
  const { name, description, chapter_type, status } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Chapter name is required.' });
  }

  try {
    await Chapter.update(chapterId, name, description || '', chapter_type, status);
    res.json({ message: 'Chapter updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/chapters/:id
 * Remove a chapter and all its user enrolments (via CASCADE).
 */
const deleteChapter = async (req, res) => {
  const chapterId = req.params.id;
  try {
    await Chapter.delete(chapterId);
    res.json({ message: 'Chapter deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/chapters/add-user
 * Enrol a user in a chapter.
 * Body: { userId, chapterId }
 */
const addUserToChapter = async (req, res) => {
  const { userId, chapterId } = req.body;

  if (!userId || !chapterId) {
    return res.status(400).json({ error: 'userId and chapterId are required.' });
  }

  try {
    await Chapter.addUserToChapter(userId, chapterId);
    res.status(201).json({ message: 'User added to chapter successfully.' });
  } catch (err) {
    // Duplicate primary key means the user is already enrolled
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'User is already enrolled in this chapter.' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/chapters/:id/users
 * Return all users enrolled in a chapter.
 */
const getUsersInChapter = async (req, res) => {
  const chapterId = req.params.id;
  try {
    const [users] = await Chapter.getUsersInChapter(chapterId);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/chapters/stats
 * Return aggregate dashboard stats: counts by type, by status, enrolments, totals.
 */
const getStats = async (req, res) => {
  try {
    const stats = await Chapter.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
  addUserToChapter,
  getUsersInChapter,
  getStats,
};
