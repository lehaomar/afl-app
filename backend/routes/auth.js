const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'afl_secret_2026';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const admin = db.find('admins', a => a.username === username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET, { expiresIn: '7d' });
  res.json({ token, username: admin.username });
});

router.get('/verify', requireAuth, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

router.put('/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });

  const admin = db.findById('admins', req.admin.id);
  if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  db.update('admins', req.admin.id, { password_hash: bcrypt.hashSync(newPassword, 10) });
  res.json({ success: true });
});

module.exports = router;
