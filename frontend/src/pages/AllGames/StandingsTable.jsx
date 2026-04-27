import { useState, useEffect } from 'react';
import { getStandings } from '../../api';
import LoadingSpinner, { ErrorMessage } from '../../components/LoadingSpinner';

const MY_TEAM = 'Paradaraya';

// Top 8 go to Cup, 9th place and below do not
const ZONE_TOP = 8;

function getZone(idx, total) {
  if (idx < ZONE_TOP) return 'top';
  if (idx >= ZONE_TOP) return 'bottom';
  return 'mid';
}

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

  const total = standings.length;

  return (
    <div className="tab-content">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 380 }}>
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-afl-border">
              <th className="text-left pl-3 pr-1 py-3 w-7">#</th>
              <th className="text-left py-3 pr-2">Команда</th>
              <th className="text-center py-3 px-1 w-7">И</th>
              <th className="text-center py-3 px-1 w-7 text-green-600">В</th>
              <th className="text-center py-3 px-1 w-7 text-gray-400">Н</th>
              <th className="text-center py-3 px-1 w-7 text-red-600">П</th>
              <th className="text-center py-3 px-1 w-9">ГЗ</th>
              <th className="text-center py-3 px-1 w-9">ГП</th>
              <th className="text-center py-3 px-1 w-9">РМ</th>
              <th className="text-center py-3 px-1 w-9 font-bold" style={{ color: '#C0272D' }}>О</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, idx) => {
              const isMyTeam = team.name === MY_TEAM;
              const zone = getZone(idx, total);
              const showTopDivider = false;
              const showBotDivider = idx === ZONE_TOP && total > ZONE_TOP;

              return (
                <>
                  {showTopDivider && (
                    <tr key={`div-top-${idx}`}>
                      <td colSpan={10} className="p-0">
                        <div className="border-t border-dashed border-gray-600/50" />
                      </td>
                    </tr>
                  )}
                  {showBotDivider && (
                    <tr key={`div-bot-${idx}`}>
                      <td colSpan={10} className="p-0">
                        <div className="border-t border-dashed border-red-700/40" />
                      </td>
                    </tr>
                  )}
                  <tr
                    key={team.id}
                    className={`border-b border-afl-border/40 transition-colors ${
                      isMyTeam ? '' : idx % 2 === 0 ? 'bg-afl-surface/20' : ''
                    }`}
                    style={isMyTeam ? { background: 'rgba(139,26,26,0.18)' } : {}}
                  >
                    {/* Zone indicator + rank */}
                    <td className="pl-2 pr-1 py-3">
                      <div className="flex items-center gap-1">
                        <div className={`w-1 h-5 rounded-full flex-shrink-0 ${
                          zone === 'top' ? 'bg-green-500' :
                          zone === 'bottom' ? 'bg-red-500' :
                          'bg-transparent'
                        }`} />
                        <span className="text-gray-500 font-mono text-xs w-4 text-center">{idx + 1}</span>
                      </div>
                    </td>

                    <td className="py-3 pr-2">
                      <span className="font-semibold text-sm" style={isMyTeam ? { color: '#C0272D' } : { color: '#fff' }}>
                        {team.name}
                      </span>
                      {isMyTeam && (
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(139,26,26,0.4)', color: '#C0272D' }}>
                          мы
                        </span>
                      )}
                    </td>

                    <td className="text-center py-3 px-1 text-gray-300 text-xs">{team.played}</td>
                    <td className="text-center py-3 px-1 text-green-400 text-xs font-medium">{team.won}</td>
                    <td className="text-center py-3 px-1 text-gray-400 text-xs">{team.drawn}</td>
                    <td className="text-center py-3 px-1 text-red-400 text-xs">{team.lost}</td>
                    <td className="text-center py-3 px-1 text-gray-300 text-xs">{team.goals_for}</td>
                    <td className="text-center py-3 px-1 text-gray-400 text-xs">{team.goals_against}</td>
                    <td className="text-center py-3 px-1 text-gray-400 text-xs">
                      {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                    </td>
                    <td className="text-center py-3 px-1">
                      <span className="font-bold text-sm" style={isMyTeam ? { color: '#C0272D' } : { color: '#fff' }}>
                        {team.points}
                      </span>
                    </td>
                  </tr>
                </>
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

      {/* Legend */}
      <div className="px-3 py-3 border-t border-afl-border space-y-1.5">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>И — игры</span>
          <span className="text-green-500">В — победы</span>
          <span>Н — ничьи</span>
          <span className="text-red-400">П — поражения</span>
          <span>ГЗ — голы забитые</span>
          <span>ГП — голы пропущенные</span>
          <span>РМ — разница мячей</span>
          <span className="font-semibold" style={{ color: '#C0272D' }}>О — очки</span>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-gray-500">Топ-8 · идут на Кубок</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span className="text-gray-500">С 9-го места · без Кубка</span>
          </span>
        </div>
      </div>
    </div>
  );
}
