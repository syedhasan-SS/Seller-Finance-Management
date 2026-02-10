import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface OrdersTableProps {
  orders: Order[];
  onOrderClick?: (orderId: string) => void;
}

export default function OrdersTable({ orders, onOrderClick }: OrdersTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'eligible':
        return {
          icon: CheckCircle,
          label: 'Eligible',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'pending_eligibility':
        return {
          icon: Clock,
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'held':
        return {
          icon: AlertCircle,
          label: 'Held',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
    }
  };

  const getHoldReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      RETURN_WINDOW: 'Return Window',
      BANK_VERIFICATION: 'Bank Verification Required',
      DISPUTE: 'Dispute Active',
      QC_FAILED: 'Quality Check Failed',
      COMPLIANCE_REVIEW: 'Compliance Review'
    };
    return labels[reason] || reason;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Orders Breakdown</h2>
        <p className="text-sm text-gray-600 mt-1">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} in upcoming payout
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <tr
                    key={order.orderId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onOrderClick?.(order.orderId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(order.completedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${order.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.daysUntilEligible !== undefined && (
                        <div className="text-sm text-gray-600">
                          Eligible in {order.daysUntilEligible} {order.daysUntilEligible === 1 ? 'day' : 'days'}
                        </div>
                      )}
                      {order.holdReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {order.holdReasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {getHoldReasonLabel(reason)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
