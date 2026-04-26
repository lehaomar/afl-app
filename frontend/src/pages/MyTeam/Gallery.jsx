import { useState, useEffect } from 'react';
import { getMedia } from '../../api';
import LoadingSpinner, { ErrorMessage } from '../../components/LoadingSpinner';

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedia();
      setMedia(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  if (media.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-5xl mb-3">📸</div>
        <p className="font-medium text-gray-400">Пока ничего нет</p>
        <p className="text-sm mt-1">Администратор добавит фото и видео</p>
      </div>
    );
  }

  return (
    <div className="tab-content p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="w-1 h-5 bg-green-500 rounded" />
        <h2 className="font-bold text-white">Мама я в телике ⭐</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {media.map((item) => (
          <MediaItem key={item.id} item={item} onClick={() => setSelected(item)} />
        ))}
      </div>

      {selected && (
        <Lightbox item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function MediaItem({ item, onClick }) {
  const url = `/uploads/${item.filename}`;

  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden bg-afl-elevated border border-afl-border group"
    >
      {item.type === 'photo' ? (
        <img
          src={url}
          alt={item.caption || item.original_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-afl-elevated text-gray-400 gap-1">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-center px-1 truncate w-full text-gray-500">{item.original_name}</span>
        </div>
      )}
      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}

function Lightbox({ item, onClose }) {
  const url = `/uploads/${item.filename}`;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div onClick={(e) => e.stopPropagation()} className="max-w-full max-h-[80vh] flex items-center justify-center">
        {item.type === 'photo' ? (
          <img src={url} alt={item.caption || ''} className="max-w-full max-h-[80vh] rounded-lg object-contain" />
        ) : (
          <video src={url} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg" />
        )}
      </div>

      {item.caption && (
        <p className="text-white/70 text-sm mt-3 text-center max-w-sm">{item.caption}</p>
      )}
      <p className="text-white/30 text-xs mt-1">
        {new Date(item.created_at).toLocaleDateString('ru-RU')}
      </p>
    </div>
  );
}
