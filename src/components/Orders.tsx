import { useState } from 'react';
import { ArrowLeft, Download, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { samplePayoutData, sampleOrderDetails } from '../data/sampleData';
import Header from './Header';
import OrdersTable from './OrdersTable';
import OrderDetail from './OrderDetail';

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const payoutData = samplePayoutData;
  const orderDetail = selectedOrderId ? sampleOrderDetails[selectedOrderId] : null;

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBackToDashboard = () => {
    setSelectedOrderId(null);
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  if (selectedOrderId && orderDetail) {
    return (
      <OrderDetail
        order={orderDetail}
        onBack={handleBackToDashboard}
      />
    );
  }

  const filteredOrders = payoutData.orders.filter(order =>
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sellerId={payoutData.sellerId} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600">
            Manage and track all your orders in one place
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Orders Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{payoutData.orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Eligible Orders</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {payoutData.orders.filter(o => o.status === 'eligible').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${payoutData.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <OrdersTable orders={filteredOrders} onOrderClick={handleOrderClick} />
      </main>
    </div>
  );
};

export default Orders;
