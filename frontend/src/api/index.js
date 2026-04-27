// In production on Vercel: set VITE_API_URL=https://your-app.railway.app
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

const getToken = () => localStorage.getItem('afl_token');

async function request(path, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`Сервер недоступен (${res.status})`);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── Auth ──────────────────────────────────────────────────
export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const verifyToken = () => request('/auth/verify');

export const changePassword = (currentPassword, newPassword) =>
  request('/auth/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });

// ── Teams ─────────────────────────────────────────────────
export const getTeams = () => request('/teams');

export const createTeam = (name) =>
  request('/teams', { method: 'POST', body: JSON.stringify({ name }) });

export const updateTeam = (id, name) =>
  request(`/teams/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });

export const deleteTeam = (id) =>
  request(`/teams/${id}`, { method: 'DELETE' });

// ── Matches ───────────────────────────────────────────────
export const getMatches = () => request('/matches');

export const getStandings = () => request('/matches/standings');

export const createMatch = (data) =>
  request('/matches', { method: 'POST', body: JSON.stringify(data) });

export const updateMatch = (id, data) =>
  request(`/matches/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteMatch = (id) =>
  request(`/matches/${id}`, { method: 'DELETE' });

// ── Players ───────────────────────────────────────────────
export const getPlayers = () => request('/players');

export const createPlayer = (data) =>
  request('/players', { method: 'POST', body: JSON.stringify(data) });

export const updatePlayer = (id, data) =>
  request(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deletePlayer = (id) =>
  request(`/players/${id}`, { method: 'DELETE' });

// ── Media ─────────────────────────────────────────────────
export const getMedia = () => request('/media');

export const uploadMedia = async (file, caption) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  if (caption) formData.append('caption', caption);

  const res = await fetch(`${BASE}/media`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
};

export const updateMediaCaption = (id, caption) =>
  request(`/media/${id}`, { method: 'PUT', body: JSON.stringify({ caption }) });

export const deleteMedia = (id) =>
  request(`/media/${id}`, { method: 'DELETE' });
