export default function Header({ onAdminClick, isAdmin }) {
  return (
    <header
      className="sticky top-0 z-50 shadow-lg overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.55) 100%), url('/paradaraya fon logo.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        borderBottom: '1px solid #5a1a1a',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src="/paradaraya logo.jpg"
            alt="FC Paradaraya"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            style={{ border: '1.5px solid rgba(192,39,45,0.8)' }}
          />
          <div>
            <h1 className="text-xl font-black tracking-wide text-white leading-none" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>FC Paradaraya</h1>
            <p className="text-xs font-medium tracking-wide" style={{ color: '#f0a0a0', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>Сезон 2026/2027</p>
          </div>
        </div>
        <button
          onClick={onAdminClick}
          className="flex items-center gap-1.5 hover:text-white transition-colors text-sm px-2 py-1 rounded"
          style={{ color: '#f0a0a0', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
          aria-label="Панель администратора"
        >
          {isAdmin ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium">Админ</span>
            </>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
