const express = require('express');
const { db } = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.get('teams').sort((a, b) => a.name.localeCompare(b.name)));
});

router.post('/', requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Team name is required' });

  const exists = db.find('teams', t => t.name.toLowerCase() === name.trim().toLowerCase());
  if (exists) return res.status(409).json({ error: 'Team with this name already exists' });

  const team = db.insert('teams', { name: name.trim() });
  res.status(201).json(team);
});

router.put('/:id', requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Team name is required' });

  const exists = db.find('teams', t => t.name.toLowerCase() === name.trim().toLowerCase() && t.id !== parseInt(req.params.id));
  if (exists) return res.status(409).json({ error: 'Team with this name already exists' });

  const team = db.update('teams', req.params.id, { name: name.trim() });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
});

router.delete('/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  // Also delete related matches
  const allMatches = db.get('matches');
  allMatches
    .filter(m => m.home_team_id === id || m.away_team_id === id)
    .forEach(m => db.delete('matches', m.id));

  const deleted = db.delete('teams', id);
  if (!deleted) return res.status(404).json({ error: 'Team not found' });
  res.json({ success: true });
});

module.exports = router;
