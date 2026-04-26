import { useState, useEffect } from 'react';
import { getMatches } from '../../api';
import LoadingSpinner, { ErrorMessage } from '../../components/LoadingSpinner';

const MY_TEAM = 'Paradaraya';

function MatchCard({ match }) {
  const isMyHome = match.home_team_name === MY_TEAM;
  const isMyAway = match.away_team_name === MY_TEAM;
  const involved = isMyHome || isMyAway;

  const homeWon = match.home_score > match.away_score;
  const awayWon = match.away_score > match.home_score;
  const draw = match.home_score === match.away_score;

  let myResult = null;
  if (involved && match.played) {
    if (draw) myResult = 'draw';
    else if ((isMyHome && homeWon) || (isMyAway && awayWon)) myResult = 'win';
    else myResult = 'loss';
  }

  const resultColors = {
    win: 'border-l-green-500',
    loss: 'border-l-red-500',
    draw: 'border-l-yellow-500',
  };

  return (
    <div className={`bg-afl-elevated rounded-lg p-3 border border-afl-border border-l-2 ${
      myResult ? resultColors[myResult] : 'border-l-afl-border'
    }`}>
      <div className="flex items-center gap-2">
        {/* Home team */}
        <div className="flex-1 text-right">
          <span className={`font-semibold text-sm ${isMyHome ? 'text-green-400' : 'text-white'}`}>
            {match.home_team_name}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 min-w-[70px] justify-center">
          {match.played ? (
            <>
              <span className={`text-xl font-black ${homeWon ? 'text-white' : 'text-gray-400'}`}>
                {match.home_score}
              </span>
              <span className="text-gray-500 text-sm">:</span>
              <span className={`text-xl font-black ${awayWon ? 'text-white' : 'text-gray-400'}`}>
                {match.away_score}
              </span>
            </>
          ) : (
            <span className="text-gray-500 text-sm font-medium">
              {match.match_time || 'vs'}
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 text-left">
          <span className={`font-semibold text-sm ${isMyAway ? 'text-green-400' : 'text-white'}`}>
            {match.away_team_name}
          </span>
        </div>
      </div>

      {match.match_date && (
        <p className="text-center text-xs text-gray-500 mt-1.5">
          {new Date(match.match_date).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      )}
    </div>
  );
}

export default function Results() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  // Group by round
  const rounds = {};
  for (const m of matches) {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  }

  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  if (roundNumbers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">📅</div>
        <p>Матчи ещё не добавлены</p>
      </div>
    );
  }

  return (
    <div className="tab-content p-3 space-y-4">
      {roundNumbers.map((round) => (
        <div key={round}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-afl-border" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Тур {round}
            </span>
            <div className="h-px flex-1 bg-afl-border" />
          </div>
          <div className="space-y-2">
            {rounds[round].map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
