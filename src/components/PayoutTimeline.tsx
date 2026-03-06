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
    high: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    medium: 'text-amber-700 bg-amber-50 border-amber-300',
    low: 'text-red-700 bg-red-50 border-red-300'
  };

  const progressPercentage = Math.max(0, Math.min(100, (1 - data.daysUntilPayout / 14) * 100));

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-fleek-black">Upcoming Payout</h2>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${confidenceColors[data.confidence]}`}>
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-semibold capitalize">{data.confidence} Confidence</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Estimated Payout Date</span>
          </div>
          <div className="text-2xl font-bold text-fleek-black mb-1">
            {formatDate(data.estimatedPayoutDate)}
          </div>
          <div className="text-sm text-gray-500">
            {data.daysUntilPayout} {data.daysUntilPayout === 1 ? 'day' : 'days'} until payout
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Total Amount</span>
          </div>
          <div className="text-2xl font-bold text-fleek-black mb-1">
            £{data.totalAmount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            From {data.orders.length} {data.orders.length === 1 ? 'order' : 'orders'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span className="font-medium">Progress to payout</span>
          <span className="font-bold text-fleek-black">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%`, backgroundColor: '#F8C642' }}
          />
        </div>
      </div>

      {/* Cycle info */}
      <div className="bg-fleek-yellow-light border border-fleek-yellow rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-fleek-black mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-bold text-fleek-black mb-1 text-sm">Current Payout Cycle</div>
            <div className="text-sm text-gray-700 flex flex-wrap items-center gap-x-2">
              <span>Cycle date: {formatDate(data.currentCycle)}</span>
              <span>•</span>
              <span>{data.orders.length} orders</span>
              <span>•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-fleek-black text-fleek-yellow">
                On Track
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
