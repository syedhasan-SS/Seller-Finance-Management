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
import TrustScoreWidget from './TrustScoreWidget';
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Vendor Info Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Viewing data for: <span className="font-semibold">{vendorHandle}</span>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Data source: {import.meta.env.VITE_USE_BIGQUERY === 'true' ? 'BigQuery (Live)' : 'Sample Data'}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">View All Orders</h3>
                  <p className="text-sm text-gray-500">Manage and track your orders</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/income-statement')}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Income Statement</h3>
                  <p className="text-sm text-gray-500">View financial overview</p>
                </div>
              </div>
            </button>
          </div>

          <PayoutTimeline data={payoutData} />

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OrdersTable orders={payoutData.orders} onOrderClick={handleOrderClick} />
            </div>
            <div className="space-y-6">
              <ActiveBlockers blockers={payoutData.activeBlockers} />
              <TrustScoreWidget trustScore={payoutData.trustScore} />
            </div>
          </div>

          <PayoutHistory history={payoutData.payoutHistory} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
