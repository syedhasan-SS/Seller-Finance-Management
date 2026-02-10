import { useState } from 'react';
import { Shield, TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { TrustScore } from '../types';

interface TrustScoreWidgetProps {
  trustScore: TrustScore;
}

export default function TrustScoreWidget({ trustScore }: TrustScoreWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRiskLevelConfig = (riskLevel: TrustScore['riskLevel']) => {
    switch (riskLevel) {
      case 'low':
        return {
          label: 'Good Standing',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200'
        };
      case 'medium':
        return {
          label: 'Needs Attention',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200'
        };
      case 'high':
        return {
          label: 'Action Required',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200'
        };
    }
  };

  const getTrendIcon = () => {
    switch (trustScore.trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFactorIcon = (_factor: string) => {
    return <AlertTriangle className="w-4 h-4" />;
  };

  const riskConfig = getRiskLevelConfig(trustScore.riskLevel);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div
        className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getScoreBgColor(trustScore.score)}`}>
              <Shield className={`w-6 h-6 ${getScoreColor(trustScore.score)}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Quality Score</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${riskConfig.bgColor} ${riskConfig.color} ${riskConfig.borderColor}`}>
                  {riskConfig.label}
                </span>
                {getTrendIcon()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(trustScore.score)}`}>
                {trustScore.score}
              </div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-3">Top Factors Affecting Your Score</h3>
          <div className="space-y-3">
            {trustScore.topDrivers.map((driver, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="text-yellow-600 mt-0.5">
                  {getFactorIcon(driver.factor)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {driver.description}
                    </span>
                    <span className={`text-sm font-semibold ${driver.impact < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {driver.impact > 0 ? '+' : ''}{driver.impact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to Improve Your Score</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Reduce dispatch delays by preparing orders earlier</li>
              <li>• Improve quality checks to meet marketplace standards</li>
              <li>• Maintain consistent banking information for trust</li>
            </ul>
          </div>

          <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Learn more about Trust Score →
          </button>
        </div>
      )}
    </div>
  );
}
