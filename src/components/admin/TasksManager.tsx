import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import type { AdminTask } from '@/types/adminContent';
import { fetchTasks, saveTask, deleteTask } from './adminApi';
import ConditionsEditor from './ConditionsEditor';

const URGENCIES = ['critical', 'high', 'medium', 'low'] as const;
const ICONS = [
  'CreditCard',
  'Package',
  'ShoppingBag',
  'Truck',
  'Wallet',
  'User',
  'TrendingUp',
  'BookOpen',
  'Shield',
  'Sparkles',
  'FileText',
  'Info',
] as const;

function emptyTask(): Partial<AdminTask> {
  return {
    title: '',
    description: '',
    urgency: 'medium',
    icon: 'Package',
    ctaLabel: '',
    ctaHref: '',
    estimatedMinutes: undefined,
    conditions: {},
    enabled: true,
  };
}

export default function TasksManager() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<AdminTask> | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      setTasks(await fetchTasks());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
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
      await saveTask(editing);
      setEditing(null);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return;
    try {
      setBusy(true);
      await deleteTask(id);
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
          <h1 className="text-xl sm:text-2xl font-bold text-fleek-black">Tasks</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tasks shown in the supplier Action Center. Conditions decide who sees what.
          </p>
        </div>
        <button
          onClick={() => setEditing(emptyTask())}
          className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          New task
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-sm">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          No tasks yet. Create your first one.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Urgency</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Conditions</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-fleek-black">{t.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{t.description}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {t.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <ConditionsSummary c={t.conditions} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        t.enabled
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {t.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => setEditing(t)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-fleek-black hover:bg-gray-100 rounded"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditDrawer onClose={() => setEditing(null)}>
          <h2 className="text-lg font-bold text-fleek-black mb-4">
            {editing.id ? 'Edit task' : 'Create task'}
          </h2>
          <div className="space-y-4">
            <Field label="Title">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fleek-yellow focus:outline-none"
                value={editing.title ?? ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fleek-yellow focus:outline-none"
                value={editing.description ?? ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Urgency">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  value={editing.urgency ?? 'medium'}
                  onChange={(e) => setEditing({ ...editing, urgency: e.target.value as AdminTask['urgency'] })}
                >
                  {URGENCIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>
              <Field label="Icon">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  value={editing.icon ?? 'Package'}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value as AdminTask['icon'] })}
                >
                  {ICONS.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="CTA label">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fleek-yellow focus:outline-none"
                value={editing.ctaLabel ?? ''}
                onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })}
              />
            </Field>
            <Field label="CTA link (in-app path or https URL)">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-fleek-yellow focus:outline-none"
                value={editing.ctaHref ?? ''}
                onChange={(e) => setEditing({ ...editing, ctaHref: e.target.value })}
              />
            </Field>
            <Field label="Estimated minutes (optional)">
              <input
                type="number"
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fleek-yellow focus:outline-none"
                value={editing.estimatedMinutes ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    estimatedMinutes: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  })
                }
              />
            </Field>
            <Field label="Conditions">
              <ConditionsEditor
                value={editing.conditions ?? {}}
                onChange={(c) => setEditing({ ...editing, conditions: c })}
              />
            </Field>
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
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </EditDrawer>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function ConditionsSummary({ c }: { c: AdminTask['conditions'] }) {
  const parts: string[] = [];
  if (c.lifecycles?.length) parts.push(`lifecycle: ${c.lifecycles.join(',')}`);
  if (c.bankStatuses?.length) parts.push(`bank: ${c.bankStatuses.join(',')}`);
  if (c.hasFirstListing && c.hasFirstListing !== 'any') parts.push(`listing: ${c.hasFirstListing}`);
  if (c.hasFirstOrder && c.hasFirstOrder !== 'any') parts.push(`order: ${c.hasFirstOrder}`);
  if (c.hasReceivedPayout && c.hasReceivedPayout !== 'any') parts.push(`payout: ${c.hasReceivedPayout}`);
  if (c.profileComplete && c.profileComplete !== 'any') parts.push(`profile: ${c.profileComplete}`);
  return (
    <span className="text-xs text-gray-500">
      {parts.length === 0 ? 'Any seller' : parts.join(' · ')}
    </span>
  );
}

export function EditDrawer({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full sm:w-[480px] bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Edit</div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-fleek-black">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
