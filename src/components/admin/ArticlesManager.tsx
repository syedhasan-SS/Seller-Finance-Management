import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, ArrowUpRight } from 'lucide-react';
import type { AdminFeaturedArticle } from '@/types/adminContent';
import { fetchArticles, saveArticle, deleteArticle } from './adminApi';
import ConditionsEditor from './ConditionsEditor';
import { EditDrawer } from './TasksManager';

const TAGS = ['getting-started', 'payouts', 'listings', 'support'] as const;

function empty(): Partial<AdminFeaturedArticle> {
  return {
    title: '',
    summary: '',
    href: '',
    tag: 'getting-started',
    order: 100,
    conditions: {},
    enabled: true,
  };
}

export default function ArticlesManager() {
  const [items, setItems] = useState<AdminFeaturedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<AdminFeaturedArticle> | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      setItems(await fetchArticles());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSave() {
    if (!editing) return;
    try {
      setBusy(true);
      await saveArticle(editing);
      setEditing(null);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this article?')) return;
    try {
      setBusy(true);
      await deleteArticle(id);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-fleek-black">Featured Articles</h1>
          <p className="text-sm text-gray-600 mt-1">
            Curated Help Center links shown in the Learning Center on the supplier homepage.
          </p>
        </div>
        <button
          onClick={() => setEditing(empty())}
          className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          New article
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          No featured articles yet.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-10 text-center text-xs font-semibold text-gray-500">
                #{a.order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {a.tag && (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 capitalize">
                      {a.tag.replace('-', ' ')}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      a.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {a.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <h3 className="font-semibold text-fleek-black">{a.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{a.summary}</p>
                <a
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                >
                  {a.href} <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setEditing(a)} className="p-2 text-fleek-black hover:bg-gray-100 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={busy}
                  className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditDrawer onClose={() => setEditing(null)}>
          <h2 className="text-lg font-bold text-fleek-black mb-4">
            {editing.id ? 'Edit article' : 'Create article'}
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="block text-xs font-semibold text-gray-700 mb-1">Title</span>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={editing.title ?? ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-700 mb-1">Summary</span>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={editing.summary ?? ''}
                onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-700 mb-1">Help Center URL</span>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                value={editing.href ?? ''}
                onChange={(e) => setEditing({ ...editing, href: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1">Tag</span>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  value={editing.tag ?? 'getting-started'}
                  onChange={(e) => setEditing({ ...editing, tag: e.target.value as AdminFeaturedArticle['tag'] })}
                >
                  {TAGS.map((t) => (
                    <option key={t} value={t}>{t.replace('-', ' ')}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1">Display order</span>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={editing.order ?? 100}
                  onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value, 10) || 100 })}
                />
              </label>
            </div>
            <ConditionsEditor
              value={editing.conditions ?? {}}
              onChange={(c) => setEditing({ ...editing, conditions: c })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.enabled ?? true}
                onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
              />
              Enabled
            </label>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </EditDrawer>
      )}
    </div>
  );
}
