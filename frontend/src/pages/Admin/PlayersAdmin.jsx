import { useState, useEffect } from 'react';
import { getPlayers, getTeams, createPlayer, updatePlayer, deletePlayer } from '../../api';

const EMPTY = { name: '', team_id: '', goals: 0, assists: 0 };

export default function PlayersAdmin() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([getPlayers(), getTeams()]);
      setPlayers(p);
      setTeams(t);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        team_id: form.team_id ? parseInt(form.team_id) : null,
        goals: parseInt(form.goals) || 0,
        assists: parseInt(form.assists) || 0,
      };
      if (editId) await updatePlayer(editId, payload);
      else await createPlayer(payload);
      setForm(EMPTY);
      setEditId(null);
      setShowForm(false);
      await load();
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, team_id: p.team_id || '', goals: p.goals, assists: p.assists });
    setEditId(p.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Удалить игрока "${name}"?`)) return;
    try { await deletePlayer(id); await load(); } catch (e) { setError(e.message); }
  };

  const cancelForm = () => { setForm(EMPTY); setEditId(null); setShowForm(false); setError(''); };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-white flex items-center gap-2">
          <span className="text-green-400">⚽</span> Игроки и статистика
        </h2>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setError(''); }}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            + Добавить
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 bg-red-900/30 border border-red-700/40 text-red-400 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-afl-elevated border border-afl-border rounded-xl p-4 mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-green-400">
            {editId ? 'Редактировать игрока' : 'Новый игрок'}
          </h3>

          <div>
            <label className="text-xs text-gray-400 block mb-1">ФИО игрока *</label>
            <input
              type="text" required placeholder="Иванов Иван Иванович"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Команда</label>
            <select
              value={form.team_id}
              onChange={(e) => setForm({ ...form, team_id: e.target.value })}
              className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">— Не указана —</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Голы</label>
              <input
                type="number" min="0"
                value={form.goals}
                onChange={(e) => setForm({ ...form, goals: e.target.value })}
                className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Ассисты</label>
              <input
                type="number" min="0"
                value={form.assists}
                onChange={(e) => setForm({ ...form, assists: e.target.value })}
                className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? 'Сохранение...' : editId ? 'Сохранить' : 'Добавить'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="px-4 bg-afl-surface border border-afl-border text-gray-400 hover:text-white py-2.5 rounded-lg text-sm transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-8">Загрузка...</div>
      ) : (
        <div className="space-y-2">
          {players.map((p, idx) => (
            <div key={p.id} className="bg-afl-elevated rounded-lg p-3 border border-afl-border flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-800/50 flex items-center justify-center text-xs font-bold text-green-300 flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{p.name}</p>
                <p className="text-gray-500 text-xs">{p.team_name || '—'}</p>
              </div>
              <div className="flex gap-3 text-center mr-2">
                <div>
                  <div className="text-green-400 font-bold">{p.goals}</div>
                  <div className="text-gray-600 text-xs">г</div>
                </div>
                <div>
                  <div className="text-blue-400 font-bold">{p.assists}</div>
                  <div className="text-gray-600 text-xs">п</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-white p-1 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(p.id, p.name)} className="text-gray-400 hover:text-red-400 p-1 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <div className="text-center text-gray-500 py-8">Игроки не добавлены</div>
          )}
        </div>
      )}
    </div>
  );
}
