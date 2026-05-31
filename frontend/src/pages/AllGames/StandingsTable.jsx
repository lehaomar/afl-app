import { useState, useEffect } from 'react';
import { getStandings, getMatches } from '../../api';
import LoadingSpinner, { ErrorMessage } from '../../components/LoadingSpinner';

const MY_TEAM = 'Paradaraya';
const ZONE_TOP = 8;

const STADIUM_ADDRESS = {
  'Қайрат': 'ул. Абиша Кекилбайулы, 30',
  'ЦСКА':   'ул. Сатпаева, 6Б/2',
};

function getZone(idx) {
  return idx < ZONE_TOP ? 'top' : 'bottom';
}

/* ── Team matches modal ── */
function TeamMatchesModal({ team, matches, onClose }) {
  const teamMatches = matches
    .filter((m) => m.home_team_name === team || m.away_team_name === team)
    .sort((a, b) => a.round - b.round);

  const upcoming = teamMatches.filter((m) => !m.played);
  const played   = teamMatches.filter((m) => m.played);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxHeight: '80vh',
          background: '#140D0D', borderTop: '1px solid #3d1414',
          borderRadius: '16px 16px 0 0',
          overflowY: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-afl-border">
          <div>
            <h2 className="font-bold text-white text-lg">{team}</h2>
            <p className="text-xs text-gray-500 mt-0.5">История матчей</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-afl-elevated text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 space-y-4">
          {teamMatches.length === 0 && (
            <p className="text-center text-gray-500 py-8">Матчи не найдены</p>
          )}

          {upcoming.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Предстоящие</h3>
              <div className="space-y-2">
                {upcoming.map((m) => <MatchCard key={m.id} match={m} team={team} />)}
              </div>
            </section>
          )}

          {played.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Сыгранные</h3>
              <div className="space-y-2">
                {played.map((m) => <MatchCard key={m.id} match={m} team={team} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, team }) {
  const isHome = match.home_team_name === team;
  const opponent = isHome ? match.away_team_name : match.home_team_name;

  let resultColor = null;
  let scoreLabel = null;
  if (match.played) {
    const myScore  = isHome ? match.home_score : match.away_score;
    const oppScore = isHome ? match.away_score : match.home_score;
    scoreLabel = `${myScore} : ${oppScore}`;
    if (myScore > oppScore)      resultColor = '#22c55e';
    else if (myScore < oppScore) resultColor = '#ef4444';
    else                         resultColor = '#eab308';
  }

  return (
    <div className="bg-afl-elevated rounded-lg p-3 border border-afl-border flex items-center gap-3">
      <div className="text-center min-w-[48px]">
        <div className="text-xs text-gray-500">Тур {match.round}</div>
        {match.match_date ? (
          <>
            <div className="text-white font-bold text-lg leading-tight">
              {new Date(match.match_date).getDate()}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(match.match_date).toLocaleDateString('ru-RU', { month: 'short' })}
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-sm mt-1">—</div>
        )}
        {match.match_time && (
          <div className="text-xs mt-0.5" style={{ color: '#C0272D' }}>{match.match_time}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 mb-0.5">{isHome ? 'Дома' : 'В гостях'}</div>
        <div className="font-semibold text-white text-sm truncate">vs {opponent}</div>
        {match.stadium && (
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3 h-3 flex-shrink-0" style={{ color: '#C0272D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-400 truncate">
              <span className="text-gray-300 font-medium">{match.stadium}</span>
              {STADIUM_ADDRESS[match.stadium] && `, ${STADIUM_ADDRESS[match.stadium]}`}
            </span>
          </div>
        )}
      </div>

      {match.played ? (
        <div className="text-center px-3 py-1.5 rounded-lg bg-afl-surface min-w-[56px]">
          <div className="font-black text-base" style={{ color: resultColor }}>{scoreLabel}</div>
        </div>
      ) : (
        <div className="text-center px-3 py-1.5 bg-afl-surface rounded-lg min-w-[48px]">
          <div className="text-gray-400 text-xs font-medium">Скоро</div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
export default function StandingsTable() {
  const [standings, setStandings] = useState([]);
  const [matches,   setMatches]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, allMatches] = await Promise.all([getStandings(), getMatches()]);
      setStandings(data);
      setMatches(allMatches);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} onRetry={load} />;

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
              const zone = getZone(idx);
              const showBotDivider = idx === ZONE_TOP && total > ZONE_TOP;

              return (
                <>
                  {showBotDivider && (
                    <tr key={`div-bot-${idx}`}>
                      <td colSpan={10} className="p-0">
                        <div className="border-t border-dashed border-red-700/40" />
                      </td>
                    </tr>
                  )}
                  <tr
                    key={team.id}
                    className={`border-b border-afl-border/40 transition-colors cursor-pointer hover:bg-white/5 ${
                      isMyTeam ? '' : idx % 2 === 0 ? 'bg-afl-surface/20' : ''
                    }`}
                    style={isMyTeam ? { background: 'rgba(139,26,26,0.18)' } : {}}
                    onClick={() => setSelectedTeam(team.name)}
                  >
                    <td className="pl-2 pr-1 py-3">
                      <div className="flex items-center gap-1">
                        <div className={`w-1 h-5 rounded-full flex-shrink-0 ${
                          zone === 'top' ? 'bg-green-500' : 'bg-red-500'
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

      {/* Team matches modal */}
      {selectedTeam && (
        <TeamMatchesModal
          team={selectedTeam}
          matches={matches}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
}
