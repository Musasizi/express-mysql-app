/**
 * routes/chapterRoutes.js – Chapter Management Routes
 *
 * Public routes  (no token needed – anyone can browse chapters):
 *   GET  /api/chapters        → list all chapters
 *   GET  /api/chapters/:id    → get one chapter
 *
 * Protected routes (token required – only logged-in users can modify):
 *   POST   /api/chapters              → create a chapter
 *   PUT    /api/chapters/:id          → update a chapter
 *   DELETE /api/chapters/:id          → delete a chapter
 *   POST   /api/chapters/add-user     → enrol a user in a chapter
 *   GET    /api/chapters/:id/users    → list users in a chapter
 *
 * NOTE: The static route '/chapters/add-user' must be declared BEFORE the
 * dynamic route '/chapters/:id/users'.  Express matches routes in order;
 * if :id came first, "add-user" would be treated as an id value.
 */

const express = require('express');
const chapterController = require('../controllers/chapterController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// ── Public Routes ─────────────────────────────────────────────────────────────
router.get('/chapters', chapterController.getAllChapters);
// Static route BEFORE :id routes — otherwise 'stats' is matched as an id
router.get('/chapters/stats', authenticateToken, chapterController.getStats);
router.get('/chapters/:id', chapterController.getChapterById);

// ── Protected Routes ──────────────────────────────────────────────────────────
router.post('/chapters', authenticateToken, chapterController.createChapter);
router.put('/chapters/:id', authenticateToken, chapterController.updateChapter);
router.delete('/chapters/:id', authenticateToken, chapterController.deleteChapter);

// Enrol a user in a chapter  (static path BEFORE the :id pattern – see NOTE above)
router.post('/chapters/add-user', authenticateToken, chapterController.addUserToChapter);

// List users enrolled in a chapter
router.get('/chapters/:id/users', authenticateToken, chapterController.getUsersInChapter);

module.exports = router;
