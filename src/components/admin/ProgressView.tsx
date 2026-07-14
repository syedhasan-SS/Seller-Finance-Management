import { useEffect, useMemo, useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import type { SupplierProgress } from '@/types/adminContent';
import { fetchSellerProgress } from './adminApi';

const LIFECYCLE_TONE: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  active: 'bg-emerald-50 text-emerald-700',
  power: 'bg-purple-50 text-purple-700',
  dormant: 'bg-amber-50 text-amber-700',
};

export default function ProgressView() {
  const [rows, setRows] = useState<SupplierProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSellerProgress();
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (lifecycleFilter !== 'all' && r.lifecycle !== lifecycleFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return r.vendorId.toLowerCase().includes(q) || r.shopName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [rows, query, lifecycleFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-fleek-black">Seller Progress</h1>
        <p className="text-sm text-gray-600 mt-1">
          Where each supplier sits in the journey. Click a seller to preview their homepage.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <select
          value={lifecycleFilter}
          onChange={(e) => setLifecycleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="all">All lifecycles</option>
          <option value="new">New</option>
          <option value="active">Active</option>
          <option value="power">Power</option>
          <option value="dormant">Dormant</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Vendor</th>
                  <th className="text-left px-4 py-3">Lifecycle</th>
                  <th className="text-left px-4 py-3">Profile</th>
                  <th className="text-left px-4 py-3">Bank</th>
                  <th className="text-left px-4 py-3">Listings</th>
                  <th className="text-left px-4 py-3">Orders</th>
                  <th className="text-left px-4 py-3">Payout</th>
                  <th className="text-left px-4 py-3">Open tasks</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
                  <tr key={r.vendorId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-fleek-black">{r.shopName}</div>
                      <div className="text-xs text-gray-500 font-mono">{r.vendorId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          LIFECYCLE_TONE[r.lifecycle] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {r.lifecycle}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {Math.round(r.profileCompletion * 100)}%
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 capitalize">
                      {r.bankStatus.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <YesNoDot value={r.hasFirstListing} />
                    </td>
                    <td className="px-4 py-3">
                      <YesNoDot value={r.hasFirstOrder} />
                    </td>
                    <td className="px-4 py-3">
                      <YesNoDot value={r.hasReceivedPayout} />
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-fleek-black">
                      {r.openTasksCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/home?vendor=${encodeURIComponent(r.vendorId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-fleek-black hover:bg-gray-100 rounded"
                      >
                        Preview <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                      No sellers match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function YesNoDot({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${
        value ? 'text-emerald-700' : 'text-gray-400'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${value ? 'bg-emerald-500' : 'bg-gray-300'}`} />
      {value ? 'Yes' : 'No'}
    </span>
  );
}
