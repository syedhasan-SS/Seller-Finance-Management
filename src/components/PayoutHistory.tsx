import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
          iconColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200'
        };
      case 'delayed':
        return {
          icon: Clock,
          label: 'Delayed',
          iconColor: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      case 'held':
        return {
          icon: AlertCircle,
          label: 'Held',
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Payout History</h2>
        <p className="text-sm text-gray-500">
          Last {history.length} payouts
        </p>
      </div>

      <div className="px-6 pb-6">
        <div className="relative">
          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {history.map((payout, index) => {
              const config = getStatusConfig(payout.status);
              const StatusIcon = config.icon;

              return (
                <div key={index} className="relative flex gap-4">
                  <div className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full ${config.bgColor} border ${config.borderColor} flex-shrink-0`}>
                    <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
                  </div>

                  <div className="flex-1 pb-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {formatDate(payout.payoutDate)}
                        </div>
                        <div className="text-xs text-emerald-600 font-medium">
                          {config.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {payout.orderCount} {payout.orderCount === 1 ? 'order' : 'orders'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
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

        <button className="mt-6 w-full py-2.5 text-center text-sm text-blue-600 hover:text-blue-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          View All Payouts
        </button>
      </div>
    </div>
  );
}
