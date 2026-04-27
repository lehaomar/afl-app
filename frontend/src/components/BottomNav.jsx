const tabs = [
  {
    id: 'all-games',
    label: 'Все игры',
    icon: (active) => (
      <svg className="w-6 h-6" style={{ color: active ? '#C0272D' : '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
      </svg>
    ),
  },
  {
    id: 'my-team',
    label: 'Моя команда',
    icon: (active) => (
      <svg className="w-6 h-6" style={{ color: active ? '#C0272D' : '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function BottomNav({ current, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-afl-surface border-t border-afl-border pb-safe">
      <div className="flex">
        {tabs.map((tab) => {
          const active = current === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors relative"
              style={{ color: active ? '#C0272D' : '#6b7280' }}
            >
              {tab.icon(active)}
              <span className="text-xs font-medium" style={{ color: active ? '#C0272D' : '#6b7280' }}>
                {tab.label}
              </span>
              {active && (
                <div className="absolute top-0 h-0.5 w-10 rounded-b" style={{ background: '#C0272D' }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
