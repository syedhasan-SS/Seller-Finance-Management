import { useEffect } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { useSeller } from '@/contexts/SellerContext';
import { LoadingSpinner } from '@components/LoadingSpinner';
import Header from '@components/Header';
import HomepageRenderer from './HomepageRenderer';
import { useHomeConfig } from './hooks/useHomeConfig';
import { useMockConfigOverride } from './hooks/useMockConfigOverride';
import { useEmbedMode } from './hooks/useEmbedMode';

export default function Home() {
  const { isEmbed, emit } = useEmbedMode();
  const { sellerId, vendorHandle, loading: sellerLoading, error: sellerError } = useSeller();
  const mockOverride = useMockConfigOverride();
  const effectiveSellerId = mockOverride ? null : sellerId || vendorHandle;
  const { data: fetched, loading, error, refresh } = useHomeConfig(effectiveSellerId);

  const config = mockOverride ?? fetched;

  // Intercept link/button clicks so the native host can deep-link instead of
  // (or in addition to) WebView navigation. Default behaviour is preserved.
  useEffect(() => {
    if (!isEmbed) return;
    const handler = (e: MouseEvent) => {
      const cta = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-home-cta]');
      if (!cta) return;
      const moduleEl = cta.closest<HTMLElement>('[data-home-module]');
      emit({
        type: 'home.cta.click',
        href: cta.getAttribute('data-home-href') ?? undefined,
        moduleId: moduleEl?.getAttribute('data-home-module') ?? undefined,
        taskId: cta.getAttribute('data-home-task') ?? undefined,
      });
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [isEmbed, emit]);

  if (sellerLoading || (!mockOverride && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading your homepage…</p>
        </div>
      </div>
    );
  }

  if (sellerError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Seller Selected</h2>
          <p className="text-gray-600 mb-4">{sellerError}</p>
          <p className="text-sm text-gray-500">
            Add <code className="bg-gray-100 px-2 py-1 rounded">?vendor=your-handle</code> to the URL.
          </p>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className={isEmbed ? 'bg-gray-50' : 'min-h-screen bg-gray-50'}>
        {!isEmbed && <Header sellerId={effectiveSellerId || ''} />}
        <main className={containerClass(isEmbed)}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Could not load your homepage</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className={isEmbed ? 'bg-gray-50' : 'min-h-screen bg-gray-50'}>
      {!isEmbed && <Header sellerId={config.vendorId} />}
      <main className={containerClass(isEmbed)}>
        <HomepageRenderer config={config} />
        {import.meta.env.DEV && !isEmbed && (
          <DebugStrip config={config} usingMock={!!mockOverride} />
        )}
      </main>
    </div>
  );
}

function containerClass(isEmbed: boolean): string {
  // Tighter padding inside an embed so the page sits flush against the host.
  return isEmbed
    ? 'max-w-3xl mx-auto px-3 py-3'
    : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8';
}

function DebugStrip({
  config,
  usingMock,
}: {
  config: import('@/types/homeConfig').HomeConfig;
  usingMock: boolean;
}) {
  return (
    <div className="mt-8 text-xs text-gray-400 font-mono border-t border-dashed border-gray-200 pt-3 break-all">
      <span className="mr-3">
        lifecycle: <span className="text-fleek-black">{config.lifecycle}</span>
      </span>
      <span className="mr-3">
        ruleset: <span className="text-fleek-black">{config.meta.rulesetVersion}</span>
      </span>
      {usingMock && <span className="mr-3 text-amber-600">[mockConfig active]</span>}
      {config.meta.firedRuleIds && config.meta.firedRuleIds.length > 0 && (
        <span>
          rules: <span className="text-fleek-black">{config.meta.firedRuleIds.join(', ')}</span>
        </span>
      )}
    </div>
  );
}
