const express = require('express');
const { db, getStandings } = require('../database');
const requireAuth = require('../middleware/auth');

const router = express.Router();

function withTeams(match) {
  const home = db.findById('teams', match.home_team_id);
  const away = db.findById('teams', match.away_team_id);
  return {
    ...match,
    home_team_name: home?.name || 'Unknown',
    away_team_name: away?.name || 'Unknown',
  };
}

router.get('/', (req, res) => {
  const matches = db.get('matches')
    .sort((a, b) => a.round - b.round || a.id - b.id)
    .map(withTeams);
  res.json(matches);
});

router.get('/standings', (req, res) => {
  res.json(getStandings());
});

router.post('/', requireAuth, (req, res) => {
  const { round, home_team_id, away_team_id, home_score, away_score, match_date, match_time, played } = req.body;

  if (!round || !home_team_id || !away_team_id)
    return res.status(400).json({ error: 'Round, home team and away team are required' });

  if (parseInt(home_team_id) === parseInt(away_team_id))
    return res.status(400).json({ error: 'Home and away teams must be different' });

  const isPlayed = !!played;
  const match = db.insert('matches', {
    round: parseInt(round),
    home_team_id: parseInt(home_team_id),
    away_team_id: parseInt(away_team_id),
    home_score: isPlayed ? (parseInt(home_score) || 0) : null,
    away_score: isPlayed ? (parseInt(away_score) || 0) : null,
    match_date: match_date || null,
    match_time: match_time || null,
    played: isPlayed,
  });
  res.status(201).json(withTeams(match));
});

router.put('/:id', requireAuth, (req, res) => {
  const { round, home_team_id, away_team_id, home_score, away_score, match_date, match_time, played } = req.body;

  const existing = db.findById('matches', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Match not found' });

  const isPlayed = !!played;
  const match = db.update('matches', req.params.id, {
    round: parseInt(round),
    home_team_id: parseInt(home_team_id),
    away_team_id: parseInt(away_team_id),
    home_score: isPlayed ? (parseInt(home_score) || 0) : null,
    away_score: isPlayed ? (parseInt(away_score) || 0) : null,
    match_date: match_date || null,
    match_time: match_time || null,
    played: isPlayed,
  });
  res.json(withTeams(match));
});

router.delete('/:id', requireAuth, (req, res) => {
  const deleted = db.delete('matches', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Match not found' });
  res.json({ success: true });
});

module.exports = router;
