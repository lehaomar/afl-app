import { useState, useEffect } from 'react';
import { getPlayers } from '../../api';
import LoadingSpinner, { ErrorMessage } from '../../components/LoadingSpinner';

const MY_TEAM = 'Paradaraya';

const medals = ['🥇', '🥈', '🥉'];

export default function TopScorers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getPlayers();
      // Show only Paradaraya players, sorted by goals then assists
      const mine = all
        .filter((p) => p.team_name === MY_TEAM)
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists);
      setPlayers(mine);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  if (players.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">⚽</div>
        <p>Игроки ещё не добавлены</p>
      </div>
    );
  }

  return (
    <div className="tab-content p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="w-1 h-5 bg-green-500 rounded" />
        <h2 className="font-bold text-white">Бомбардиры — {MY_TEAM}</h2>
      </div>

      <div className="space-y-2">
        {players.map((player, idx) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              idx === 0
                ? 'bg-yellow-900/20 border-yellow-700/40'
                : 'bg-afl-elevated border-afl-border'
            }`}
          >
            {/* Rank */}
            <div className="w-8 text-center">
              {medals[idx] ? (
                <span className="text-xl">{medals[idx]}</span>
              ) : (
                <span className="text-gray-500 font-mono text-sm">{idx + 1}</span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-green-800/60 flex items-center justify-center text-green-300 font-bold text-sm flex-shrink-0">
              {player.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{player.name}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 flex-shrink-0">
              <div className="text-center">
                <div className="text-green-400 font-black text-xl leading-none">{player.goals}</div>
                <div className="text-gray-500 text-xs mt-0.5">голов</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg leading-none">{player.assists}</div>
                <div className="text-gray-500 text-xs mt-0.5">пасов</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
