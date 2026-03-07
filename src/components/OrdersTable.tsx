import { CheckCircle, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface OrdersTableProps {
  orders: Order[];
  onOrderClick?: (orderId: string) => void;
}

export default function OrdersTable({ orders, onOrderClick }: OrdersTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'eligible':
        return { icon: CheckCircle, label: 'Eligible', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'pending_eligibility':
        return { icon: AlertCircle, label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'held':
        return { icon: AlertCircle, label: 'Held', className: 'bg-red-50 text-red-700 border-red-200' };
    }
  };

  const getDetailsText = (order: Order) => {
    if (order.status === 'pending_eligibility' && order.daysUntilEligible) {
      return `Eligible in ${order.daysUntilEligible} days`;
    }
    if (order.holdReasons?.length) {
      return order.holdReasons.includes('RETURN_WINDOW') ? 'Return Window' : order.holdReasons[0];
    }
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-fleek-black mb-0.5">Orders Breakdown</h2>
        <p className="text-sm text-gray-500">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} in upcoming payout
        </p>
      </div>

      {/* ── Mobile card view (hidden on md+) ─────────────────────────────── */}
      <div className="md:hidden divide-y divide-gray-100">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          const detailsText = getDetailsText(order);

          return (
            <div
              key={order.orderId}
              className="p-4 hover:bg-fleek-yellow-light active:bg-fleek-yellow-light transition-colors cursor-pointer"
              onClick={() => onOrderClick?.(order.orderId)}
            >
              {/* Row 1: Order ID + Status badge */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-fleek-black">
                    {order.internalOrderId || order.orderId}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt || order.completedAt)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${statusConfig.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                  {detailsText && (
                    <div className="text-xs text-gray-400">{detailsText}</div>
                  )}
                </div>
              </div>

              {/* Row 2: Product name */}
              {order.productName && order.productName !== 'N/A' && (
                <div className="text-sm text-gray-600 mb-2 truncate">{order.productName}</div>
              )}

              {/* Row 3: Financials */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Base</div>
                    <div className="font-medium text-gray-800">
                      £{(order.originalFinalBase || order.amount).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Commission</div>
                    <div className="font-medium text-red-500">
                      -{order.commissionPercentage ? `${order.commissionPercentage}%` : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-0.5">Payout</div>
                  <div className="text-base font-bold text-fleek-black">
                    £{(order.totalPaidAmount || order.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table view (hidden on mobile) ────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Base Price</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Commission</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Payout</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              return (
                <tr
                  key={order.orderId}
                  className="hover:bg-fleek-yellow-light transition-colors cursor-pointer"
                  onClick={() => onOrderClick?.(order.orderId)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-fleek-black">{order.internalOrderId || order.orderId}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{order.orderId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800 max-w-xs truncate font-medium" title={order.productName}>
                      {order.productName || 'N/A'}
                    </div>
                    {order.includesShipping && (
                      <span className="text-xs text-gray-500 mt-0.5 inline-block">+ Shipping</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{formatDate(order.createdAt || order.completedAt)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-800">
                      £{(order.originalFinalBase || order.amount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm text-red-600 font-medium">
                      -{order.commissionPercentage ? `${order.commissionPercentage}%` : 'N/A'}
                    </div>
                    {order.originalCommission && (
                      <div className="text-xs text-gray-400 mt-0.5">£{order.originalCommission.toFixed(2)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-fleek-black">
                      £{(order.totalPaidAmount || order.amount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${statusConfig.className}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                    {getDetailsText(order) && (
                      <div className="text-xs text-gray-400 mt-1">{getDetailsText(order)}</div>
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
