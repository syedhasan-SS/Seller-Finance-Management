import { useState } from 'react';
import { samplePayoutData, sampleOrderDetails } from '../data/sampleData';
import Header from './Header';
import PayoutTimeline from './PayoutTimeline';
import OrdersTable from './OrdersTable';
import ActiveBlockers from './ActiveBlockers';
import TrustScoreWidget from './TrustScoreWidget';
import PayoutHistory from './PayoutHistory';
import OrderDetail from './OrderDetail';

export const Dashboard: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Use sample data directly (no Supabase needed)
  const payoutData = samplePayoutData;
  const orderDetail = selectedOrderId ? sampleOrderDetails[selectedOrderId] : null;

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBackToDashboard = () => {
    setSelectedOrderId(null);
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
    <div className="min-h-screen bg-gray-50">
      <Header sellerId={payoutData.sellerId} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
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
