import { CheckCircle, AlertCircle } from 'lucide-react';
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
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'pending_eligibility':
        return {
          icon: AlertCircle,
          label: 'Pending',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'held':
        return {
          icon: AlertCircle,
          label: 'Held',
          className: 'bg-red-50 text-red-700 border-red-200'
        };
    }
  };

  const getDetailsText = (order: Order) => {
    if (order.status === 'pending_eligibility' && order.daysUntilEligible) {
      return `Eligible in ${order.daysUntilEligible} days`;
    }
    if (order.holdReasons && order.holdReasons.length > 0) {
      if (order.holdReasons.includes('RETURN_WINDOW')) {
        return 'Return Window';
      }
      return order.holdReasons[0];
    }
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Orders Breakdown</h2>
        <p className="text-sm text-gray-500">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} in upcoming payout
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-y border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Base Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Commission
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Payout
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <tr
                    key={order.orderId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onOrderClick?.(order.orderId)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.internalOrderId || order.orderId}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={order.productName}>
                        {order.productName || 'N/A'}
                      </div>
                      {order.includesShipping && (
                        <span className="text-xs text-blue-600 mt-0.5 inline-block">+ Shipping</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{formatDate(order.createdAt || order.completedAt)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-gray-900">
                        £{(order.originalFinalBase || order.amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-red-600">
                        -{order.commissionPercentage ? `${order.commissionPercentage}%` : 'N/A'}
                      </div>
                      {order.originalCommission && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          £{order.originalCommission.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-semibold text-emerald-700">
                        £{(order.totalPaidAmount || order.amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${statusConfig.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                      {getDetailsText(order) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {getDetailsText(order)}
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
