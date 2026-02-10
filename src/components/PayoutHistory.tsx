import { CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';
import { PayoutHistoryItem } from '../types';

interface PayoutHistoryProps {
  history: PayoutHistoryItem[];
}

export default function PayoutHistory({ history }: PayoutHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status: PayoutHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'delayed':
        return {
          icon: Clock,
          label: 'Delayed',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'held':
        return {
          icon: AlertCircle,
          label: 'Held',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Payout History</h2>
        <p className="text-sm text-gray-600 mt-1">
          Last {history.length} payouts
        </p>
      </div>

      <div className="p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {history.map((payout, index) => {
              const config = getStatusConfig(payout.status);
              const StatusIcon = config.icon;

              return (
                <div key={index} className="relative flex gap-4">
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor}`}>
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          {formatDate(payout.payoutDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            {payout.orderCount} {payout.orderCount === 1 ? 'order' : 'orders'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ${payout.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="mt-6 w-full py-2 text-center text-sm text-blue-600 hover:text-blue-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          View All Payouts
        </button>
      </div>
    </div>
  );
}
