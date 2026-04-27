import { useState, useEffect, useRef } from 'react';
import { getPosts, createPost, deletePost, updatePostCaption, uploadsUrl } from '../../api';

export default function MediaAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const [editCaption, setEditCaption] = useState({ id: null, value: '' });
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try { setPosts(await getPosts()); } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFilesChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError('');
    try {
      await createPost(selectedFiles, caption);
      setCaption('');
      setSelectedFiles([]);
      if (fileRef.current) fileRef.current.value = '';
      await load();
    } catch (e) { setError(e.message); }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить пост?')) return;
    try { await deletePost(id); await load(); } catch (e) { setError(e.message); }
  };

  const handleSaveCaption = async (id) => {
    try {
      await updatePostCaption(id, editCaption.value);
      setEditCaption({ id: null, value: '' });
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-green-400">📸</span> Фото и видео галерея
      </h2>

      {/* Create post */}
      <div className="bg-afl-elevated border border-afl-border rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Новый пост</h3>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault(); }}
          placeholder={"Описание поста\n(Shift+Enter — перенос строки)"}
          rows={5}
          className="w-full bg-afl-surface border border-afl-border rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-green-500 resize-y min-h-[100px]"
        />

        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors mb-3 ${selectedFiles.length > 0 ? 'border-green-500/70 bg-green-900/10' : 'border-afl-border hover:border-green-500/50 hover:bg-green-900/10'}`}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFilesChange}
            className="hidden"
          />
          {selectedFiles.length > 0 ? (
            <div className="text-center">
              <p className="text-green-400 text-sm font-medium mb-1">
                Выбрано {selectedFiles.length} файл(ов)
              </p>
              <p className="text-gray-500 text-xs line-clamp-2">
                {selectedFiles.map(f => f.name).join(', ')}
              </p>
              <p className="text-gray-600 text-xs mt-1">Нажмите чтобы изменить</p>
            </div>
          ) : (
            <>
              <svg className="w-9 h-9 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span className="text-gray-400 text-sm font-medium">Нажмите для выбора файлов</span>
              <span className="text-gray-600 text-xs mt-1">Можно выбрать несколько — они станут каруселью</span>
            </>
          )}
        </label>

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-500 text-white"
          style={selectedFiles.length === 0 || uploading ? {} : { background: '#8B1A1A' }}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              Загрузка...
            </span>
          ) : 'Опубликовать пост'}
        </button>
      </div>

      {error && (
        <div className="mb-3 bg-red-900/30 border border-red-700/40 text-red-400 text-sm rounded-lg px-3 py-2">{error}</div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Загрузка...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Посты не добавлены</div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <PostRow
              key={post.id}
              post={post}
              editCaption={editCaption}
              setEditCaption={setEditCaption}
              onSaveCaption={handleSaveCaption}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostRow({ post, editCaption, setEditCaption, onSaveCaption, onDelete }) {
  const files = post.files || [];

  return (
    <div className="bg-afl-elevated rounded-xl border border-afl-border overflow-hidden">
      {/* Thumbnails */}
      <div className="flex gap-1 p-2 overflow-x-auto">
        {files.map((f, i) => (
          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-afl-surface flex-shrink-0 relative">
            {f.type === 'photo' ? (
              <img src={uploadsUrl(f.filename)} alt="" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-afl-surface text-green-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-3 pb-3">
        <p className="text-gray-500 text-xs mb-2">
          {files.length} файл{files.length === 1 ? '' : files.length < 5 ? 'а' : 'ов'} · {new Date(post.created_at).toLocaleDateString('ru-RU')}
        </p>

        {editCaption.id === post.id ? (
          <div className="flex gap-1">
            <textarea
              value={editCaption.value}
              onChange={(e) => setEditCaption({ ...editCaption, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.shiftKey) return;
                if (e.key === 'Enter') { e.preventDefault(); onSaveCaption(post.id); }
              }}
              className="flex-1 bg-afl-surface border border-green-500 rounded px-2 py-1 text-white text-sm focus:outline-none resize-none"
              placeholder="Описание поста"
              rows={2}
              autoFocus
            />
            <button onClick={() => onSaveCaption(post.id)} className="text-green-400 px-2 text-lg">✓</button>
            <button onClick={() => setEditCaption({ id: null, value: '' })} className="text-gray-500 px-1">✕</button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setEditCaption({ id: post.id, value: post.caption || '' })}
              className="text-left text-sm flex-1 min-w-0"
            >
              {post.caption
                ? <span className="text-gray-300">{post.caption}</span>
                : <span className="text-gray-600 italic">+ добавить описание</span>
              }
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
