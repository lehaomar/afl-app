require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// In production on Railway: set DATA_DIR=/data (persistent volume)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'db.json');

let _data = {
  teams: [],
  matches: [],
  players: [],
  media: [],
  admins: [],
  _seq: { teams: 1, matches: 1, players: 1, media: 1, admins: 1 },
};

// Load from file
function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      _data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      if (!_data._seq) _data._seq = { teams: 1, matches: 1, players: 1, media: 1, admins: 1 };
    }
  } catch (e) {
    console.error('DB load error:', e.message);
  }
}

// Save to file (sync, safe)
function save() {
  try {
    const tmp = DB_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(_data, null, 2));
    fs.renameSync(tmp, DB_PATH);
  } catch (e) {
    console.error('DB save error:', e.message);
  }
}

function nextId(table) {
  if (!_data._seq[table]) _data._seq[table] = 1;
  return _data._seq[table]++;
}

// Simple DB API
const db = {
  get: (table) => [...(_data[table] || [])],
  find: (table, fn) => (_data[table] || []).find(fn) || null,
  findById: (table, id) => (_data[table] || []).find(r => r.id === parseInt(id)) || null,
  filter: (table, fn) => (_data[table] || []).filter(fn),

  insert: (table, record) => {
    if (!_data[table]) _data[table] = [];
    const row = { id: nextId(table), created_at: new Date().toISOString(), ...record };
    _data[table].push(row);
    save();
    return row;
  },

  update: (table, id, changes) => {
    const idx = (_data[table] || []).findIndex(r => r.id === parseInt(id));
    if (idx === -1) return null;
    _data[table][idx] = { ..._data[table][idx], ...changes };
    save();
    return _data[table][idx];
  },

  delete: (table, id) => {
    const before = (_data[table] || []).length;
    _data[table] = (_data[table] || []).filter(r => r.id !== parseInt(id));
    const deleted = before !== _data[table].length;
    if (deleted) save();
    return deleted;
  },

  raw: () => _data,
};

function getStandings() {
  const teams = db.get('teams');
  const matches = db.filter('matches', m => m.played);

  const table = {};
  for (const t of teams) {
    table[t.id] = {
      id: t.id, name: t.name,
      played: 0, won: 0, drawn: 0, lost: 0,
      goals_for: 0, goals_against: 0, goal_diff: 0, points: 0,
    };
  }

  for (const m of matches) {
    const home = table[m.home_team_id];
    const away = table[m.away_team_id];
    if (!home || !away) continue;

    const hs = m.home_score ?? 0;
    const as_ = m.away_score ?? 0;

    home.played++; away.played++;
    home.goals_for += hs; home.goals_against += as_;
    away.goals_for += as_; away.goals_against += hs;

    if (hs > as_)      { home.won++; home.points += 3; away.lost++; }
    else if (hs < as_) { away.won++; away.points += 3; home.lost++; }
    else               { home.drawn++; away.drawn++; home.points++; away.points++; }
  }

  return Object.values(table)
    .map(s => ({ ...s, goal_diff: s.goals_for - s.goals_against }))
    .sort((a, b) => b.points - a.points || b.goal_diff - a.goal_diff || b.goals_for - a.goals_for);
}

function initDatabase() {
  load();

  // Seed default admin
  const hasAdmin = db.find('admins', a => a.username === (process.env.ADMIN_USERNAME || 'admin'));
  if (!hasAdmin) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    db.insert('admins', { username: process.env.ADMIN_USERNAME || 'admin', password_hash: hash });
    console.log('✓ Default admin created (admin / admin123)');
  }

  // Seed example teams
  if (db.get('teams').length === 0) {
    ['Paradaraya', 'Динамо', 'Спартак', 'Локомотив', 'ЦСКА', 'Зенит'].forEach(name =>
      db.insert('teams', { name })
    );
    console.log('✓ Example teams seeded');
  }
}

module.exports = { db, initDatabase, getStandings };
