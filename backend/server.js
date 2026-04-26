require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { initDatabase, db } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Persistent dirs — in production use /data volume on Railway
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
const BACKUPS_DIR = process.env.BACKUPS_DIR || path.join(__dirname, 'backups');
[UPLOADS_DIR, BACKUPS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// CORS — allow Vercel frontend + local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // e.g. https://afl-paradaraya.vercel.app
].filter(Boolean);

app.use(cors({
  origin: isProd ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Initialize database
initDatabase();

// API Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/teams',   require('./routes/teams'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/players', require('./routes/players'));
app.use('/api/media',   require('./routes/media'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Auto backup every day at 03:00
cron.schedule('0 3 * * *', () => {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      teams:   db.get('teams'),
      matches: db.get('matches'),
      players: db.get('players'),
      media:   db.get('media'),
    };
    const filename = `backup_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(path.join(BACKUPS_DIR, filename), JSON.stringify(backup, null, 2));
    console.log(`✓ Backup: ${filename}`);
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.startsWith('backup_')).sort();
    if (files.length > 30) {
      files.slice(0, files.length - 30).forEach(f => fs.unlinkSync(path.join(BACKUPS_DIR, f)));
    }
  } catch (err) {
    console.error('✗ Backup failed:', err.message);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏆 AFL Backend → http://localhost:${PORT}`);
  console.log(`👤 Admin: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'admin123'}\n`);
});
