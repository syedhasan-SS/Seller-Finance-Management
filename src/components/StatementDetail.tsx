import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Search, Info, Copy } from 'lucide-react';
import Header from './Header';

// Sample statement detail data
const statementData = {
  'PK2NBY8TW72-2026-008': {
    id: 'PK2NBY8TW72-2026-008',
    amount: 110.18,
    period: '16 Feb 2026 - 22 Feb 2026',
    status: 'Ready to Release',
    expectedPayoutDate: '',
    openingBalance: 0.00,
    deliveredOrders: {
      subtotal: 367.70,
      items: [
        { name: 'Income Tax Withholding', amount: -4.00 },
        { name: 'Co-funded Voucher Max', amount: -4.30 },
        { name: 'Sales Tax Withholding', amount: -4.00 },
        { name: 'Shipping Fee Paid by Buyer', amount: 165.00 },
        { name: 'Product Price Paid by Buyer', amount: 215.00 }
      ]
    },
    transactionFees: {
      subtotal: 246.02,
      items: [
        { name: 'Commission Fee', amount: -35.86 },
        { name: 'Payment Fee', amount: -5.57 },
        { name: 'Free Shipping Max Fee', amount: -14.84 },
        { name: 'Shipping Fee', amount: -189.75 }
      ]
    },
    logistics: {
      subtotal: -11.50,
      items: [
        { name: 'Handling Fee', amount: -11.50 }
      ]
    },
    closingBalance: 110.18,
    orders: [
      {
        id: '23643481474807',
        lineId: 'ID:23643481474807',
        product: 'Rivaj Mahal Hair Oil – Herbal Hair Oil',
        image: '/placeholder-product.jpg',
        creationDate: '11 Feb 2026 10:18',
        status: 'Ready to Release',
        amount: 110.18
      }
    ]
  }
};

export const StatementDetail: React.FC = () => {
  const navigate = useNavigate();
  const { statementId } = useParams<{ statementId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [feeFilter, setFeeFilter] = useState('all');

  const statement = statementId ? statementData[statementId as keyof typeof statementData] : null;

  const handleBack = () => {
    navigate('/income-statement');
  };

  if (!statement) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header sellerId="SEL-789" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Statement Not Found</h2>
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Income Statement
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sellerId="SEL-789" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/dashboard')} className="hover:text-gray-900">
            Home
          </button>
          <span>/</span>
          <button onClick={handleBack} className="hover:text-gray-900">
            My Income
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Statement Detail</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Statement Detail</h1>

        {/* Statement Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">Statement Overview</h2>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
          </div>

          {/* Amount Display */}
          <div className="mb-6">
            <h3 className="text-4xl font-bold text-blue-600 mb-4">PKR {statement.amount.toFixed(2)}</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Statement Number: </span>
                <span className="font-medium text-gray-900">{statement.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Statement Period: </span>
                <span className="font-medium text-gray-900">{statement.period}</span>
              </div>
              <div>
                <span className="text-gray-600">Statement Status: </span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  statement.status === 'Released'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {statement.status}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Expected Payout Date: </span>
                <span className="font-medium text-gray-900">{statement.expectedPayoutDate || '-'}</span>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="space-y-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fee Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fee Name</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Fee Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">Opening Balance</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-sm text-right font-medium">PKR {statement.openingBalance.toFixed(2)}</td>
                </tr>

                {/* Delivered Orders */}
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900" rowSpan={statement.deliveredOrders.items.length + 1}>
                    Delivered Orders
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">Subtotal</td>
                  <td className="py-3 px-4 text-sm text-right font-medium">PKR {statement.deliveredOrders.subtotal.toFixed(2)}</td>
                </tr>
                {statement.deliveredOrders.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-700 pl-8">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">PKR {item.amount.toFixed(2)}</td>
                  </tr>
                ))}

                {/* Transaction Fees */}
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900" rowSpan={statement.transactionFees.items.length + 1}>
                    Transaction Fees
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">Subtotal</td>
                  <td className="py-3 px-4 text-sm text-right font-medium">PKR {statement.transactionFees.subtotal.toFixed(2)}</td>
                </tr>
                {statement.transactionFees.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-700 pl-8">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">PKR {item.amount.toFixed(2)}</td>
                  </tr>
                ))}

                {/* Logistics */}
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900" rowSpan={statement.logistics.items.length + 1}>
                    Logistics & Fulfillment Services
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">Subtotal</td>
                  <td className="py-3 px-4 text-sm text-right font-medium">PKR {statement.logistics.subtotal.toFixed(2)}</td>
                </tr>
                {statement.logistics.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-700 pl-8">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">PKR {item.amount.toFixed(2)}</td>
                  </tr>
                ))}

                {/* Closing Balance */}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="py-4 px-4 text-base font-bold text-blue-900">Closing Balance</td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-base font-bold text-blue-900 text-right">PKR {statement.closingBalance.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Statement Detail Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Statement Detail</h2>
              <Info className="w-4 h-4 text-gray-400" />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order No/Order ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Name
                </label>
                <select
                  value={feeFilter}
                  onChange={(e) => setFeeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Please Select</option>
                  <option value="commission">Commission Fee</option>
                  <option value="shipping">Shipping Fee</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFeeFilter('all');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order Creation Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Release Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Released Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Statement Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {statement.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.product}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            <span>Order Number: {order.id}</span>
                            <button className="text-blue-600 hover:text-blue-700">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span>Order Line ID: {order.lineId}</span>
                            <button className="text-blue-600 hover:text-blue-700 ml-1">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.creationDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'Released'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">Amount</div>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Show Fee Details ▼
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>PKR {order.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{statement.id}</div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Copy className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View Order Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select className="px-2 py-1 border border-gray-200 rounded text-sm">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed">
                &lt; Previous
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm text-blue-600 hover:bg-gray-100 rounded">
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StatementDetail;
