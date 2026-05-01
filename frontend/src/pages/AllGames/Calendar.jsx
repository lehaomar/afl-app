import { useState, useEffect } from 'react';
import { getMatches } from '../../api';
import LoadingSpinner, { ErrorMessage } from '../../components/LoadingSpinner';

const MY_TEAM = 'Paradaraya';

const STADIUM_ADDRESS = {
  'Қайрат': 'ул. Абиша Кекилбайулы, 30',
  'ЦСКА':   'ул. Сатпаева, 6Б/2',
};

export default function Calendar() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getMatches();
      const mine = all.filter(
        (m) => m.home_team_name === MY_TEAM || m.away_team_name === MY_TEAM
      );
      setMatches(mine);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">📆</div>
        <p>Матчи Paradaraya ещё не добавлены</p>
      </div>
    );
  }

  const upcoming = matches.filter((m) => !m.played);
  const played = matches.filter((m) => m.played);

  return (
    <div className="tab-content p-3 space-y-4">
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Предстоящие матчи
          </h2>
          <div className="space-y-2">
            {upcoming.map((m) => (
              <CalendarCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {played.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Сыгранные матчи
          </h2>
          <div className="space-y-2">
            {played.map((m) => (
              <CalendarCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CalendarCard({ match }) {
  const isHome = match.home_team_name === MY_TEAM;
  const opponent = isHome ? match.away_team_name : match.home_team_name;

  let result = null;
  if (match.played) {
    const myScore = isHome ? match.home_score : match.away_score;
    const oppScore = isHome ? match.away_score : match.home_score;
    if (myScore > oppScore) result = { label: 'П', color: 'text-green-400 bg-green-900/40', score: `${myScore}:${oppScore}` };
    else if (myScore < oppScore) result = { label: 'П', color: 'text-red-400 bg-red-900/40', score: `${myScore}:${oppScore}` };
    else result = { label: 'Н', color: 'text-yellow-400 bg-yellow-900/40', score: `${myScore}:${oppScore}` };
  }

  return (
    <div className="bg-afl-elevated rounded-lg p-3 border border-afl-border flex items-center gap-3">
      <div className="text-center min-w-[52px]">
        <div className="text-xs text-gray-500 font-medium">Тур {match.round}</div>
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
          <div className="text-gray-500 text-sm">—</div>
        )}
        {match.match_time && (
          <div className="text-xs text-green-400">{match.match_time}</div>
        )}
      </div>

      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-0.5">{isHome ? 'Дома' : 'В гостях'}</div>
        <div className="font-semibold text-white">vs {opponent}</div>
        {match.stadium && (
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3 h-3 flex-shrink-0" style={{ color: '#C0272D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-400">
              <span className="text-gray-300 font-medium">{match.stadium}</span>
              {STADIUM_ADDRESS[match.stadium] && `, ${STADIUM_ADDRESS[match.stadium]}`}
            </span>
          </div>
        )}
      </div>

      {result ? (
        <div className={`text-center px-3 py-1.5 rounded-lg ${result.color}`}>
          <div className="text-lg font-black">{result.score}</div>
        </div>
      ) : (
        <div className="text-center px-3 py-1.5 bg-afl-surface rounded-lg">
          <div className="text-gray-400 text-xs font-medium">Скоро</div>
        </div>
      )}
    </div>
  );
}
