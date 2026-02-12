import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign } from 'lucide-react';
import { samplePayoutData, sampleOrderDetails } from '../data/sampleData';
import Header from './Header';
import PayoutTimeline from './PayoutTimeline';
import OrdersTable from './OrdersTable';
import ActiveBlockers from './ActiveBlockers';
import TrustScoreWidget from './TrustScoreWidget';
import PayoutHistory from './PayoutHistory';
import OrderDetail from './OrderDetail';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
