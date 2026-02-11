import { AlertTriangle } from 'lucide-react';
import { TrustScore } from '../types';

interface TrustScoreWidgetProps {
  trustScore: TrustScore;
}

export default function TrustScoreWidget({ trustScore }: TrustScoreWidgetProps) {
  const getRiskLevelConfig = (riskLevel: TrustScore['riskLevel']) => {
    switch (riskLevel) {
      case 'low':
        return {
          label: 'Good Standing',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200'
        };
      case 'medium':
        return {
          label: 'Needs Attention',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      case 'high':
        return {
          label: 'Action Required',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const riskConfig = getRiskLevelConfig(trustScore.riskLevel);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quality Score</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${riskConfig.bgColor} ${riskConfig.textColor} ${riskConfig.borderColor}`}>
            {riskConfig.label}
          </span>
        </div>

        <div className="flex items-center mb-6">
          <div className="mr-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-amber-600 mb-1">
              {trustScore.score}
            </div>
            <div className="text-sm text-gray-500">out of 100</div>
          </div>
        </div>

        <div className="space-y-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Factors Affecting Your Score</h3>
          {trustScore.topDrivers.map((driver, index) => (
            <div
              key={index}
              className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-2 flex-1">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  {driver.description}
                </span>
              </div>
              <span className="text-sm font-semibold text-red-600 ml-4">
                {driver.impact}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">How to Improve Your Score</h4>
          <ul className="text-sm text-blue-700 space-y-1.5">
            <li>• Reduce dispatch delays by preparing orders earlier</li>
            <li>• Improve quality checks to meet marketplace standards</li>
            <li>• Maintain consistent banking information for trust</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
