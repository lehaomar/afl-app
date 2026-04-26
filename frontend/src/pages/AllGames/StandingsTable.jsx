import { useState, useEffect } from 'react';
import { getStandings } from '../../api';
import LoadingSpinner, { ErrorMessage } from '../../components/LoadingSpinner';

const MY_TEAM = 'Paradaraya';

export default function StandingsTable() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStandings();
      setStandings(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="tab-content">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-afl-border">
              <th className="text-left pl-4 pr-2 py-3 w-8">#</th>
              <th className="text-left py-3 pr-2">Команда</th>
              <th className="text-center py-3 px-1 w-8">И</th>
              <th className="text-center py-3 px-1 w-8">З</th>
              <th className="text-center py-3 px-1 w-8">П</th>
              <th className="text-center py-3 px-1 w-10">РМ</th>
              <th className="text-center py-3 px-1 w-10 font-bold text-green-500">О</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, idx) => {
              const isMyTeam = team.name === MY_TEAM;
              return (
                <tr
                  key={team.id}
                  className={`border-b border-afl-border/50 transition-colors ${
                    isMyTeam
                      ? 'bg-green-900/20 border-l-2 border-l-green-500'
                      : idx % 2 === 0 ? 'bg-afl-surface/30' : ''
                  }`}
                >
                  <td className="pl-4 pr-2 py-3.5 text-gray-500 font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 pr-2">
                    <span className={`font-semibold ${isMyTeam ? 'text-green-400' : 'text-white'}`}>
                      {team.name}
                    </span>
                    {isMyTeam && (
                      <span className="ml-1.5 text-xs bg-green-700/40 text-green-400 px-1.5 py-0.5 rounded font-medium">
                        мы
                      </span>
                    )}
                  </td>
                  <td className="text-center py-3.5 px-1 text-gray-300">{team.played}</td>
                  <td className="text-center py-3.5 px-1 text-gray-300">
                    {team.goals_for}
                  </td>
                  <td className="text-center py-3.5 px-1 text-gray-400">
                    {team.goals_against}
                  </td>
                  <td className="text-center py-3.5 px-1 text-gray-400 text-xs">
                    {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                  </td>
                  <td className="text-center py-3.5 px-1">
                    <span className={`font-bold text-base ${isMyTeam ? 'text-green-400' : 'text-white'}`}>
                      {team.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {standings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">🏆</div>
          <p>Таблица ещё пуста</p>
        </div>
      )}

      <div className="px-4 py-3 flex gap-4 text-xs text-gray-500 border-t border-afl-border">
        <span>И — игры</span>
        <span>З — забито</span>
        <span>П — пропущено</span>
        <span>РМ — разница мячей</span>
        <span className="text-green-500 font-semibold">О — очки</span>
      </div>
    </div>
  );
}
