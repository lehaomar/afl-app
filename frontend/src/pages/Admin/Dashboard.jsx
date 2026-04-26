import { useState } from 'react';
import TeamsAdmin from './TeamsAdmin';
import MatchesAdmin from './MatchesAdmin';
import PlayersAdmin from './PlayersAdmin';
import MediaAdmin from './MediaAdmin';

const TABS = [
  { id: 'matches', label: '📅 Матчи' },
  { id: 'teams',   label: '🏅 Команды' },
  { id: 'players', label: '⚽ Игроки' },
  { id: 'media',   label: '📸 Медиа' },
];

export default function AdminDashboard({ onLogout, onBack }) {
  const [tab, setTab] = useState('matches');

  return (
    <div className="min-h-[calc(100dvh-60px)] flex flex-col">
      {/* Admin top bar */}
      <div className="bg-green-900/40 border-b border-green-800/50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-green-400 font-bold text-sm">Панель администратора</span>
        </div>
        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-red-400 transition-colors text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Выйти
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-afl-border bg-afl-surface overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              tab === t.id ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-t" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'matches' && <MatchesAdmin />}
        {tab === 'teams'   && <TeamsAdmin />}
        {tab === 'players' && <PlayersAdmin />}
        {tab === 'media'   && <MediaAdmin />}
      </div>
    </div>
  );
}
