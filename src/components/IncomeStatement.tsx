import { ArrowLeft, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { samplePayoutData } from '../data/sampleData';
import Header from './Header';

export const IncomeStatement: React.FC = () => {
  const navigate = useNavigate();
  const payoutData = samplePayoutData;

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  // Calculate income statement data
  const totalRevenue = payoutData.payoutHistory.reduce((sum, p) => sum + p.amount, 0) + payoutData.totalAmount;
  const avgPayout = totalRevenue / (payoutData.payoutHistory.length + 1);
  const monthlyGrowth = 8.5; // Sample growth percentage

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Income Statement</h1>
            <p className="text-gray-600">
              Financial overview and performance metrics
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export Report</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-sm text-emerald-600 font-medium">+{monthlyGrowth}% from last month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Avg Payout</p>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              ${avgPayout.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Per payout cycle</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Payouts</p>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <span className="text-xl">💳</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {payoutData.payoutHistory.length + 1}
            </p>
            <p className="text-sm text-gray-500">Total cycles</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Pending</p>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600 mb-1">
              ${payoutData.totalAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Next payout</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Period</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Current Month</p>
                  <p className="text-xs text-gray-500 mt-1">February 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${payoutData.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-emerald-600 font-medium">Pending</p>
                </div>
              </div>

              {payoutData.payoutHistory.slice(0, 4).map((payout, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(payout.payoutDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{payout.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${payout.amount.toFixed(2)}</p>
                    <p className="text-xs text-emerald-600 font-medium">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Order Fulfillment Rate</span>
                  <span className="text-sm font-bold text-gray-900">98.5%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '98.5%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">On-Time Delivery</span>
                  <span className="text-sm font-bold text-gray-900">95.2%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '95.2%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Quality Score</span>
                  <span className="text-sm font-bold text-gray-900">{payoutData.trustScore.score}/100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: `${payoutData.trustScore.score}%` }}></div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Growing Revenue</p>
                    <p className="text-sm text-blue-700">
                      Your revenue has increased by {monthlyGrowth}% compared to last month. Keep up the great work!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Statement</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(payoutData.estimatedPayoutDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    Upcoming Payout
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {payoutData.orders.length}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    ${payoutData.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Pending
                    </span>
                  </td>
                </tr>

                {payoutData.payoutHistory.map((payout, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(payout.payoutDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      Payout Cycle
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {payout.orderCount}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      ${payout.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                        payout.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : payout.status === 'delayed'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {payout.status === 'completed' ? 'Completed' : payout.status === 'delayed' ? 'Delayed' : 'Held'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncomeStatement;
