import { CheckCircle2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { PayoutData } from '../types';

interface PayoutTimelineProps {
  data: PayoutData;
}

export default function PayoutTimeline({ data }: PayoutTimelineProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const confidenceColors = {
    high: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    medium: 'text-amber-700 bg-amber-50 border-amber-300',
    low: 'text-red-700 bg-red-50 border-red-300'
  };

  const progressPercentage = Math.max(0, Math.min(100, (1 - data.daysUntilPayout / 14) * 100));

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8 border border-gray-100">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-fleek-black">Upcoming Payout</h2>
        <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-xs sm:text-sm font-semibold capitalize ${confidenceColors[data.confidence]}`}>
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">{data.confidence} </span>Confidence
        </div>
      </div>

      {/* Stats — 2 cols on all sizes */}
      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-5 sm:mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Payout Date</span>
          </div>
          <div className="text-base sm:text-2xl font-bold text-fleek-black leading-tight mb-1">
            {formatDate(data.estimatedPayoutDate)}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {data.daysUntilPayout} {data.daysUntilPayout === 1 ? 'day' : 'days'} away
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Total Amount</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-fleek-black mb-1">
            £{data.totalAmount.toFixed(2)}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {data.orders.length} {data.orders.length === 1 ? 'order' : 'orders'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
          <span className="font-medium">Progress to payout</span>
          <span className="font-bold text-fleek-black">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%`, backgroundColor: '#F8C642' }}
          />
        </div>
      </div>

      {/* Cycle info */}
      <div className="bg-fleek-yellow-light border border-fleek-yellow rounded-lg p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-fleek-black mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-fleek-black mb-1 text-xs sm:text-sm">Current Payout Cycle</div>
            <div className="text-xs sm:text-sm text-gray-700 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Cycle: {formatDate(data.currentCycle)}</span>
              <span className="hidden sm:inline">•</span>
              <span>{data.orders.length} orders</span>
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
