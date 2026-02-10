import { ArrowLeft, Download, AlertCircle, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { OrderDetailView } from '../types';
import OrderTimeline from './OrderTimeline';

interface OrderDetailProps {
  order: OrderDetailView;
  onBack: () => void;
}

export default function OrderDetail({ order, onBack }: OrderDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status: OrderDetailView['currentStatus']) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid',
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'eligible':
        return {
          label: 'Eligible',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'held':
        return {
          label: 'Held',
          color: 'bg-red-100 text-red-800 border-red-200'
        };
    }
  };

  const statusConfig = getStatusConfig(order.currentStatus);

  const totalDays = order.keyDates[order.keyDates.length - 1]?.daysFromStart || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{order.orderId}</h1>
              <p className="text-gray-600">Completed: {formatDate(order.completedDate)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${order.amount.toFixed(2)}
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                {order.currentStatus === 'paid' && <CheckCircle2 className="w-4 h-4" />}
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <OrderTimeline timeline={order.timeline} holds={order.holds} />

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Key Dates Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Milestone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Elapsed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.keyDates.map((keyDate, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{keyDate.milestone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{keyDate.date}</td>
                    <td className="px-6 py-4 text-sm">
                      {keyDate.daysFromStart === 0 ? (
                        <span className="text-gray-600">Start</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          +{keyDate.daysFromStart} {keyDate.daysFromStart === 1 ? 'day' : 'days'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Total time from order to payout:</span> {totalDays} days
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product</span>
                <p className="text-gray-900 font-medium mt-1">{order.orderDetails.productName}</p>
              </div>
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">SKU</span>
                <p className="text-gray-900 font-medium mt-1">{order.orderDetails.sku}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
                <p className="text-gray-900 font-medium mt-1">{order.orderDetails.category}</p>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Return Window</span>
                <p className="text-gray-900 font-medium mt-1">{order.orderDetails.returnWindowDays} days</p>
              </div>
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">QC Reviewer</span>
                <p className="text-gray-900 font-medium mt-1">{order.orderDetails.qcReviewer}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bank Account</span>
                <p className="text-gray-900 font-medium mt-1">****{order.orderDetails.bankAccountLast4}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              <AlertCircle className="w-4 h-4" />
              Report Issue
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              <MoreHorizontal className="w-4 h-4" />
              More Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
