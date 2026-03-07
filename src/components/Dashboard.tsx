import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, RefreshCw } from 'lucide-react';
import { sampleOrderDetails } from '../data/sampleData';
import { useSeller } from '../contexts/SellerContext';
import { getPayoutData } from '../services';
import type { PayoutData } from '../types';
import Header from './Header';
import PayoutTimeline from './PayoutTimeline';
import OrdersTable from './OrdersTable';
import ActiveBlockers from './ActiveBlockers';
import PayoutHistory from './PayoutHistory';
import OrderDetail from './OrderDetail';
import { LoadingSpinner } from './LoadingSpinner';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { sellerId, vendorHandle, loading: sellerLoading, error: sellerError } = useSeller();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerLoading && (sellerId || vendorHandle)) {
      loadPayoutData();
    }
  }, [sellerId, vendorHandle, sellerLoading]);

  async function loadPayoutData() {
    try {
      setLoading(true);
      setError(null);
      console.log('[Dashboard] Loading payout data for:', sellerId || vendorHandle);

      const data = await getPayoutData(sellerId || vendorHandle || '');
      setPayoutData(data);
      console.log('[Dashboard] Payout data loaded successfully');
    } catch (err) {
      console.error('[Dashboard] Error loading payout data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payout data');
    } finally {
      setLoading(false);
    }
  }

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBackToDashboard = () => {
    setSelectedOrderId(null);
  };

  const handleRefresh = () => {
    loadPayoutData();
  };

  // Loading state
  if (sellerLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading payout data...</p>
        </div>
      </div>
    );
  }

  // Error state - Seller not found
  if (sellerError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Seller Selected</h2>
            <p className="text-gray-600 mb-6">{sellerError}</p>
            <p className="text-sm text-gray-500">
              Add <code className="bg-gray-100 px-2 py-1 rounded">?vendor=your-handle</code> to the URL
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - Data loading failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header sellerId={sellerId || vendorHandle || ''} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!payoutData) {
    return null;
  }

  // Order detail view
  const orderDetail = selectedOrderId ? sampleOrderDetails[selectedOrderId] : null;
  if (selectedOrderId && orderDetail) {
    return (
      <OrderDetail
        order={orderDetail}
        onBack={handleBackToDashboard}
      />
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      <Header sellerId={payoutData.sellerId} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Vendor Info Banner */}
          <div className="bg-fleek-black rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">
                  Viewing: <span className="text-fleek-yellow">{vendorHandle}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                  Data source: {import.meta.env.VITE_USE_BIGQUERY === 'true' ? 'BigQuery (Live)' : 'Sample Data'}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors text-xs sm:text-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Actions — side by side on all sizes */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md hover:border-fleek-yellow transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-fleek-yellow rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-fleek-black" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-fleek-black leading-tight">View Orders</h3>
                  <p className="text-xs text-gray-500 hidden sm:block mt-0.5">Manage and track your orders</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/income-statement')}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md hover:border-fleek-yellow transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-fleek-black rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-fleek-yellow" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-fleek-black leading-tight">Income</h3>
                  <p className="text-xs text-gray-500 hidden sm:block mt-0.5">View financial overview</p>
                </div>
              </div>
            </button>
          </div>

          <PayoutTimeline data={payoutData} />

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <OrdersTable orders={payoutData.orders} onOrderClick={handleOrderClick} />
            </div>
            <div className="space-y-4 sm:space-y-6">
              <ActiveBlockers blockers={payoutData.activeBlockers} />
            </div>
          </div>

          <PayoutHistory history={payoutData.payoutHistory} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
