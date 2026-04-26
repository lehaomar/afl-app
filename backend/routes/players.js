const express = require('express');
const { db } = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();

function withTeam(player) {
  const team = player.team_id ? db.findById('teams', player.team_id) : null;
  return { ...player, team_name: team?.name || null };
}

router.get('/', (req, res) => {
  const players = db.get('players')
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .map(withTeam);
  res.json(players);
});

router.post('/', requireAuth, (req, res) => {
  const { name, team_id, goals, assists } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Player name is required' });

  const player = db.insert('players', {
    name: name.trim(),
    team_id: team_id ? parseInt(team_id) : null,
    goals: parseInt(goals) || 0,
    assists: parseInt(assists) || 0,
  });
  res.status(201).json(withTeam(player));
});

router.put('/:id', requireAuth, (req, res) => {
  const { name, team_id, goals, assists } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Player name is required' });

  const existing = db.findById('players', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Player not found' });

  const player = db.update('players', req.params.id, {
    name: name.trim(),
    team_id: team_id ? parseInt(team_id) : null,
    goals: parseInt(goals) || 0,
    assists: parseInt(assists) || 0,
  });
  res.json(withTeam(player));
});

router.delete('/:id', requireAuth, (req, res) => {
  const deleted = db.delete('players', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Player not found' });
  res.json({ success: true });
});

module.exports = router;
