import { CheckCircle2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { PayoutData } from '../types';

interface PayoutTimelineProps {
  data: PayoutData;
}

export default function PayoutTimeline({ data }: PayoutTimelineProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const confidenceColors = {
    high: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-red-600 bg-red-50 border-red-200'
  };

  const progressPercentage = Math.max(0, Math.min(100, (1 - data.daysUntilPayout / 14) * 100));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Upcoming Payout</h2>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${confidenceColors[data.confidence]}`}>
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{data.confidence} Confidence</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">Estimated Payout Date</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatDate(data.estimatedPayoutDate)}
          </div>
          <div className="text-sm text-gray-500">
            {data.daysUntilPayout} {data.daysUntilPayout === 1 ? 'day' : 'days'} until payout
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Total Amount</span>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            ${data.totalAmount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            From {data.orders.length} {data.orders.length === 1 ? 'order' : 'orders'}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress to payout</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-blue-900 mb-1">Current Payout Cycle</div>
            <div className="text-sm text-blue-700">
              Cycle date: {formatDate(data.currentCycle)} • {data.orders.length} orders •
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-200 text-blue-800">
                On Track
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
