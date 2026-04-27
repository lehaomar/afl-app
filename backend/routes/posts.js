const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(jpeg|jpg|png|gif|webp|mp4|mov|avi|webm)$/i.test(file.originalname);
    cb(ok ? null : new Error('Only images and videos allowed'), ok);
  },
});

router.get('/', (req, res) => {
  res.json(db.get('posts').reverse());
});

router.post('/', requireAuth, upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: 'No files uploaded' });

  const files = req.files.map(f => ({
    filename: f.filename,
    original_name: f.originalname,
    type: /\.(mp4|mov|avi|webm)$/i.test(f.originalname) ? 'video' : 'photo',
  }));

  const post = db.insert('posts', { caption: req.body.caption || null, files });
  res.status(201).json(post);
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.findById('posts', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Post not found' });
  const post = db.update('posts', req.params.id, { caption: req.body.caption || null });
  res.json(post);
});

router.delete('/:id', requireAuth, (req, res) => {
  const post = db.findById('posts', req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  (post.files || []).forEach(f => {
    const fp = path.join(UPLOADS_DIR, f.filename);
    if (fs.existsSync(fp)) { try { fs.unlinkSync(fp); } catch (_) {} }
  });

  db.delete('posts', req.params.id);
  res.json({ success: true });
});

module.exports = router;
