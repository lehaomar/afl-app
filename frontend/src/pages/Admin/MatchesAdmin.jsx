import { useState, useEffect } from 'react';
import { getMatches, getTeams, createMatch, updateMatch, deleteMatch } from '../../api';

const EMPTY_FORM = {
  round: '', home_team_id: '', away_team_id: '',
  home_score: '', away_score: '', match_date: '', match_time: '', played: false,
};

export default function MatchesAdmin() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [m, t] = await Promise.all([getMatches(), getTeams()]);
      setMatches(m);
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
        ...form,
        round: parseInt(form.round),
        home_team_id: parseInt(form.home_team_id),
        away_team_id: parseInt(form.away_team_id),
        home_score: form.played ? parseInt(form.home_score) || 0 : null,
        away_score: form.played ? parseInt(form.away_score) || 0 : null,
      };
      if (editId) await updateMatch(editId, payload);
      else await createMatch(payload);
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      await load();
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  const handleEdit = (match) => {
    setForm({
      round: match.round,
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      home_score: match.home_score ?? '',
      away_score: match.away_score ?? '',
      match_date: match.match_date || '',
      match_time: match.match_time || '',
      played: !!match.played,
    });
    setEditId(match.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот матч?')) return;
    setError('');
    try { await deleteMatch(id); await load(); } catch (e) { setError(e.message); }
  };

  const cancelForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-white flex items-center gap-2">
          <span className="text-green-400">📅</span> Управление матчами
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

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-afl-elevated border border-afl-border rounded-xl p-4 mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-green-400">
            {editId ? 'Редактировать матч' : 'Новый матч'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Тур *</label>
              <input
                type="number" min="1" required
                value={form.round}
                onChange={(e) => setForm({ ...form, round: e.target.value })}
                className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Дата</label>
              <input
                type="date"
                value={form.match_date}
                onChange={(e) => setForm({ ...form, match_date: e.target.value })}
                className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Команда хозяев *</label>
            <select
              required
              value={form.home_team_id}
              onChange={(e) => setForm({ ...form, home_team_id: e.target.value })}
              className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">— Выберите команду —</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Команда гостей *</label>
            <select
              required
              value={form.away_team_id}
              onChange={(e) => setForm({ ...form, away_team_id: e.target.value })}
              className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">— Выберите команду —</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Время</label>
            <input
              type="text" placeholder="18:00"
              value={form.match_time}
              onChange={(e) => setForm({ ...form, match_time: e.target.value })}
              className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.played}
              onChange={(e) => setForm({ ...form, played: e.target.checked })}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm text-gray-300">Матч сыгран</span>
          </label>

          {form.played && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Голы хозяев</label>
                <input
                  type="number" min="0"
                  value={form.home_score}
                  onChange={(e) => setForm({ ...form, home_score: e.target.value })}
                  className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Голы гостей</label>
                <input
                  type="number" min="0"
                  value={form.away_score}
                  onChange={(e) => setForm({ ...form, away_score: e.target.value })}
                  className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? 'Сохранение...' : editId ? 'Сохранить' : 'Добавить матч'}
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

      {/* Match list */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Загрузка...</div>
      ) : (
        <div className="space-y-4">
          {rounds.map((round) => (
            <div key={round}>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Тур {round}
              </div>
              <div className="space-y-2">
                {matches.filter((m) => m.round === round).map((match) => (
                  <div key={match.id} className="bg-afl-elevated rounded-lg p-3 border border-afl-border">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm">
                        <div className="flex items-center gap-2 justify-between">
                          <span className="text-white font-medium">{match.home_team_name}</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-xs ${match.played ? 'bg-green-900/40 text-green-400' : 'bg-afl-surface text-gray-500'}`}>
                            {match.played ? `${match.home_score} : ${match.away_score}` : 'vs'}
                          </span>
                          <span className="text-white font-medium">{match.away_team_name}</span>
                        </div>
                        {match.match_date && (
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            {new Date(match.match_date).toLocaleDateString('ru-RU')}
                            {match.match_time ? ` в ${match.match_time}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => handleEdit(match)} className="text-gray-400 hover:text-white p-1 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(match.id)} className="text-gray-400 hover:text-red-400 p-1 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <div className="text-center text-gray-500 py-8">Матчи не добавлены</div>
          )}
        </div>
      )}
    </div>
  );
}
