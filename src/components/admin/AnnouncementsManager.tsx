import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import type { AdminAnnouncement } from '@/types/adminContent';
import { fetchAnnouncements, saveAnnouncement, deleteAnnouncement } from './adminApi';
import ConditionsEditor from './ConditionsEditor';
import { EditDrawer } from './TasksManager';

const SEVERITIES = ['info', 'warning', 'error'] as const;

function emptyAnnouncement(): Partial<AdminAnnouncement> {
  return {
    severity: 'info',
    title: '',
    body: '',
    ctaLabel: '',
    ctaHref: '',
    conditions: {},
    startsAt: null,
    endsAt: null,
    dismissible: true,
    enabled: true,
  };
}

export default function AnnouncementsManager() {
  const [items, setItems] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<AdminAnnouncement> | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      setItems(await fetchAnnouncements());
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
      await saveAnnouncement(editing);
      setEditing(null);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return;
    try {
      setBusy(true);
      await deleteAnnouncement(id);
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
          <h1 className="text-xl sm:text-2xl font-bold text-fleek-black">Announcements</h1>
          <p className="text-sm text-gray-600 mt-1">
            Banner-style messages shown at the top of the supplier homepage.
          </p>
        </div>
        <button
          onClick={() => setEditing(emptyAnnouncement())}
          className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          New announcement
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          No announcements yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full uppercase font-semibold ${
                        a.severity === 'error'
                          ? 'bg-red-50 text-red-700'
                          : a.severity === 'warning'
                          ? 'bg-fleek-yellow-light text-fleek-black'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        a.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {a.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {a.dismissible && (
                      <span className="text-xs text-gray-500">dismissible</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-fleek-black">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{a.body}</p>
                  {(a.startsAt || a.endsAt) && (
                    <p className="text-xs text-gray-500 mt-2">
                      Schedule: {a.startsAt ?? '—'} → {a.endsAt ?? '—'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditing(a)}
                    className="p-2 text-fleek-black hover:bg-gray-100 rounded"
                  >
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
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditDrawer onClose={() => setEditing(null)}>
          <h2 className="text-lg font-bold text-fleek-black mb-4">
            {editing.id ? 'Edit announcement' : 'Create announcement'}
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="block text-xs font-semibold text-gray-700 mb-1">Severity</span>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                value={editing.severity ?? 'info'}
                onChange={(e) => setEditing({ ...editing, severity: e.target.value as AdminAnnouncement['severity'] })}
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-700 mb-1">Title</span>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={editing.title ?? ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-700 mb-1">Body</span>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={editing.body ?? ''}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1">CTA label (optional)</span>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={editing.ctaLabel ?? ''}
                  onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1">CTA link (optional)</span>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  value={editing.ctaHref ?? ''}
                  onChange={(e) => setEditing({ ...editing, ctaHref: e.target.value })}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1">Starts at (optional)</span>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={editing.startsAt ?? ''}
                  onChange={(e) => setEditing({ ...editing, startsAt: e.target.value || null })}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1">Ends at (optional)</span>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={editing.endsAt ?? ''}
                  onChange={(e) => setEditing({ ...editing, endsAt: e.target.value || null })}
                />
              </label>
            </div>
            <ConditionsEditor
              value={editing.conditions ?? {}}
              onChange={(c) => setEditing({ ...editing, conditions: c })}
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.dismissible ?? true}
                  onChange={(e) => setEditing({ ...editing, dismissible: e.target.checked })}
                />
                Dismissible by seller
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.enabled ?? true}
                  onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                />
                Enabled
              </label>
            </div>
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
