import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { usePayoutData, useOrderDetail } from '@services/queries';
import Header from './Header';
import PayoutTimeline from './PayoutTimeline';
import OrdersTable from './OrdersTable';
import ActiveBlockers from './ActiveBlockers';
import TrustScoreWidget from './TrustScoreWidget';
import PayoutHistory from './PayoutHistory';
import OrderDetail from './OrderDetail';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const sellerId = user?.user_metadata?.seller_id;

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: payoutData, isLoading, error } = usePayoutData(sellerId);
  const { data: orderDetail } = useOrderDetail(selectedOrderId);

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBackToDashboard = () => {
    setSelectedOrderId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your payout data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-medium">Error loading payout data</p>
          <p className="text-sm mt-1">{error instanceof Error ? error.message : 'An error occurred'}</p>
        </div>
      </div>
    );
  }

  if (!payoutData) {
    return null;
  }

  if (selectedOrderId && orderDetail) {
    return (
      <OrderDetail
        order={orderDetail}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header sellerId={payoutData.sellerId} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <PayoutTimeline data={payoutData} />

          <div className="grid lg:grid-cols-2 gap-6">
            <OrdersTable orders={payoutData.orders} onOrderClick={handleOrderClick} />
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
