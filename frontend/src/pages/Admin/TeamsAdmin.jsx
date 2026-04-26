import { useState, useEffect } from 'react';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../../api';

export default function TeamsAdmin() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setTeams(await getTeams()); } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createTeam(name.trim());
      setName('');
      await load();
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await updateTeam(id, editName.trim());
      setEditId(null);
      await load();
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  const handleDelete = async (id, teamName) => {
    if (!confirm(`Удалить команду "${teamName}"? Все её матчи тоже будут удалены.`)) return;
    setError('');
    try {
      await deleteTeam(id);
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-green-400">🏅</span> Управление командами
      </h2>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название команды"
          className="flex-1 bg-afl-elevated border border-afl-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Добавить
        </button>
      </form>

      {error && (
        <div className="mb-3 bg-red-900/30 border border-red-700/40 text-red-400 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-8">Загрузка...</div>
      ) : (
        <div className="space-y-2">
          {teams.map((team) => (
            <div key={team.id} className="bg-afl-elevated rounded-lg p-3 border border-afl-border flex items-center gap-2">
              {editId === team.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-afl-surface border border-green-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(team.id)}
                    disabled={submitting}
                    className="text-green-400 hover:text-green-300 text-sm font-medium px-2"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="text-gray-500 hover:text-gray-300 text-sm px-1"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-white font-medium text-sm">{team.name}</span>
                  <button
                    onClick={() => { setEditId(team.id); setEditName(team.name); setError(''); }}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(team.id, team.name)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
          {teams.length === 0 && (
            <div className="text-center text-gray-500 py-8">Команды не добавлены</div>
          )}
        </div>
      )}
    </div>
  );
}
