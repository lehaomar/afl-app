const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '../uploads');

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
  res.json(db.get('media').reverse());
});

router.post('/', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const isVideo = /\.(mp4|mov|avi|webm)$/i.test(req.file.originalname);
  const item = db.insert('media', {
    type: isVideo ? 'video' : 'photo',
    filename: req.file.filename,
    original_name: req.file.originalname,
    caption: req.body.caption || null,
  });
  res.status(201).json(item);
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.findById('media', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Media not found' });

  const item = db.update('media', req.params.id, { caption: req.body.caption || null });
  res.json(item);
});

router.delete('/:id', requireAuth, (req, res) => {
  const item = db.findById('media', req.params.id);
  if (!item) return res.status(404).json({ error: 'Media not found' });

  const filePath = path.join(UPLOADS_DIR, item.filename);
  if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (_) {} }

  db.delete('media', req.params.id);
  res.json({ success: true });
});

module.exports = router;
