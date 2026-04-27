import { useState, useEffect } from 'react';
import { getPosts, uploadsUrl } from '../../api';
import LoadingSpinner, { ErrorMessage } from '../../components/LoadingSpinner';

export default function Gallery() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try { setPosts(await getPosts()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-5xl mb-3">📸</div>
        <p className="font-medium text-gray-400">Пока ничего нет</p>
        <p className="text-sm mt-1">Администратор добавит фото и видео</p>
      </div>
    );
  }

  return (
    <div className="max-w-[540px] mx-auto">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onOpen={(idx) => setLightbox({ post, index: idx })}
        />
      ))}
      {lightbox && (
        <Lightbox
          post={lightbox.post}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function PostCard({ post, onOpen }) {
  const [current, setCurrent] = useState(0);
  const files = post.files || [];
  const total = files.length;
  const file = files[current];

  const prev = (e) => { e.stopPropagation(); setCurrent(c => (c - 1 + total) % total); };
  const next = (e) => { e.stopPropagation(); setCurrent(c => (c + 1) % total); };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="mb-1 border-b border-afl-border">
      {/* Media area */}
      <div
        className="relative bg-black aspect-square overflow-hidden cursor-pointer"
        onClick={() => onOpen(current)}
      >
        {file && (
          file.type === 'photo' ? (
            <img
              src={uploadsUrl(file.filename)}
              alt={post.caption || ''}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <video
              src={uploadsUrl(file.filename)}
              className="w-full h-full object-contain"
              playsInline muted loop autoPlay
            />
          )
        )}

        {/* Carousel arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white text-xl leading-none hover:bg-black/70 transition-colors"
            >‹</button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white text-xl leading-none hover:bg-black/70 transition-colors"
            >›</button>
            {/* Counter badge */}
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              {current + 1}/{total}
            </div>
          </>
        )}

        {/* Video play icon overlay (when paused/no autoplay) */}
        {file?.type === 'video' && (
          <div className="absolute bottom-3 left-3 bg-black/50 rounded-full p-1.5 pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Dots indicator */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 py-2">
          {files.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-2 h-2 bg-blue-500' : 'w-1.5 h-1.5 bg-gray-600'}`}
            />
          ))}
        </div>
      )}

      {/* Caption + date */}
      <div className={`px-4 pb-4 ${total <= 1 ? 'pt-3' : 'pt-1'}`}>
        {post.caption && (
          <p className="text-white text-sm leading-relaxed mb-1 whitespace-pre-wrap">{post.caption}</p>
        )}
        <p className="text-gray-500 text-xs">{formatDate(post.created_at)}</p>
      </div>
    </div>
  );
}

function Lightbox({ post, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const files = post.files || [];
  const total = files.length;
  const file = files[current];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % total);
      if (e.key === 'ArrowLeft') setCurrent(c => (c - 1 + total) % total);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [total, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/96 flex flex-col" onClick={onClose}>
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      {/* Media */}
      <div
        className="flex-1 flex items-center justify-center p-4 relative"
        onClick={e => e.stopPropagation()}
      >
        {file && (
          file.type === 'photo' ? (
            <img
              src={uploadsUrl(file.filename)}
              alt=""
              className="max-w-full max-h-[75vh] object-contain rounded"
            />
          ) : (
            <video
              src={uploadsUrl(file.filename)}
              controls autoPlay
              className="max-w-full max-h-[75vh] rounded"
            />
          )
        )}

        {total > 1 && (
          <>
            <button
              onClick={() => setCurrent(c => (c - 1 + total) % total)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-2xl hover:bg-black/70"
            >‹</button>
            <button
              onClick={() => setCurrent(c => (c + 1) % total)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-2xl hover:bg-black/70"
            >›</button>
          </>
        )}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-2 pb-2" onClick={e => e.stopPropagation()}>
          {files.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-2.5 h-2.5 bg-white' : 'w-2 h-2 bg-gray-600'}`}
            />
          ))}
        </div>
      )}

      {/* Caption + date */}
      <div className="px-6 pb-6 text-center" onClick={e => e.stopPropagation()}>
        {post.caption && (
          <p className="text-white/80 text-sm mb-1 whitespace-pre-wrap">{post.caption}</p>
        )}
        <p className="text-white/30 text-xs">
          {new Date(post.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          {total > 1 && ` · ${current + 1}/${total}`}
        </p>
      </div>
    </div>
  );
}
