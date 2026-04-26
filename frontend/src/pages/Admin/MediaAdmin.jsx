import { useState, useEffect, useRef } from 'react';
import { getMedia, uploadMedia, deleteMedia, updateMediaCaption } from '../../api';

export default function MediaAdmin() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [editCaption, setEditCaption] = useState({ id: null, value: '' });
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try { setMedia(await getMedia()); } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await uploadMedia(file, caption);
      setCaption('');
      fileRef.current.value = '';
      await load();
    } catch (e) { setError(e.message); }
    setUploading(false);
  };

  const handleDelete = async (id, filename) => {
    if (!confirm(`Удалить файл "${filename}"?`)) return;
    setError('');
    try { await deleteMedia(id); await load(); } catch (e) { setError(e.message); }
  };

  const handleSaveCaption = async (id) => {
    try {
      await updateMediaCaption(id, editCaption.value);
      setEditCaption({ id: null, value: '' });
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-green-400">📸</span> Фото и видео галерея
      </h2>

      {/* Upload section */}
      <div className="bg-afl-elevated border border-afl-border rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Загрузить файл</h3>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Подпись (необязательно)</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Описание фото или видео"
            className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-green-500"
          />
        </div>

        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${uploading ? 'border-green-500/50 bg-green-900/10' : 'border-afl-border hover:border-green-500/50 hover:bg-green-900/10'}`}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-green-400 text-sm">Загрузка...</span>
            </>
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-400 text-sm font-medium">Нажмите для выбора файла</span>
              <span className="text-gray-600 text-xs mt-1">Фото или видео, до 100 МБ</span>
            </>
          )}
        </label>
      </div>

      {error && (
        <div className="mb-3 bg-red-900/30 border border-red-700/40 text-red-400 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Media list */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Загрузка...</div>
      ) : media.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Медиафайлы не добавлены</div>
      ) : (
        <div className="space-y-2">
          {media.map((item) => (
            <div key={item.id} className="bg-afl-elevated rounded-lg border border-afl-border overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                {/* Preview */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-afl-surface flex-shrink-0">
                  {item.type === 'photo' ? (
                    <img
                      src={`/uploads/${item.filename}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-green-500">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.original_name}</p>
                  <p className="text-gray-500 text-xs">
                    {item.type === 'photo' ? '🖼 Фото' : '🎥 Видео'} ·{' '}
                    {new Date(item.created_at).toLocaleDateString('ru-RU')}
                  </p>
                  {editCaption.id === item.id ? (
                    <div className="flex gap-1 mt-1">
                      <input
                        type="text"
                        value={editCaption.value}
                        onChange={(e) => setEditCaption({ ...editCaption, value: e.target.value })}
                        className="flex-1 bg-afl-surface border border-green-500 rounded px-2 py-0.5 text-white text-xs focus:outline-none"
                        placeholder="Подпись"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveCaption(item.id)}
                        className="text-green-400 text-xs px-1"
                      >✓</button>
                      <button
                        onClick={() => setEditCaption({ id: null, value: '' })}
                        className="text-gray-500 text-xs px-1"
                      >✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditCaption({ id: item.id, value: item.caption || '' })}
                      className="text-gray-500 hover:text-gray-300 text-xs mt-0.5 text-left"
                    >
                      {item.caption || '+ добавить подпись'}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id, item.original_name)}
                  className="text-gray-400 hover:text-red-400 p-1 transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
