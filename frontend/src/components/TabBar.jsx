export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-afl-border bg-afl-surface sticky top-0 z-10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            active === tab.id
              ? 'text-green-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-t" />
          )}
        </button>
      ))}
    </div>
  );
}
