import { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, PackageCheck, Calendar, DollarSign } from 'lucide-react';
import { TimelineStep } from '../types';

interface OrderTimelineProps {
  timeline: TimelineStep[];
  holds?: Array<{ title: string; appliedDate: string; releasedDate?: string; duration?: number; reason: string; severity: string }>;
}

export default function OrderTimeline({ timeline, holds }: OrderTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStepIcon = (step: TimelineStep) => {
    switch (step.icon) {
      case 'package-check':
        return <PackageCheck className="w-5 h-5" />;
      case 'check-circle':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'calendar-check':
        return <Calendar className="w-5 h-5" />;
      case 'dollar-sign':
        return <DollarSign className="w-5 h-5" />;
      case 'clock':
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStepColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return {
          dot: 'bg-green-500',
          line: 'bg-green-200',
          text: 'text-green-600',
          bgLight: 'bg-green-50'
        };
      case 'current':
        return {
          dot: 'bg-yellow-500',
          line: 'bg-yellow-200',
          text: 'text-yellow-600',
          bgLight: 'bg-yellow-50'
        };
      case 'pending':
        return {
          dot: 'bg-gray-300',
          line: 'bg-gray-200',
          text: 'text-gray-500',
          bgLight: 'bg-gray-50'
        };
    }
  };

  const toggleStep = (step: string) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Order Lifecycle Timeline</h2>
        <p className="text-sm text-gray-600 mt-1">Complete journey through the payout process</p>
      </div>

      <div className="p-6">
        <div className="space-y-0">
          {timeline.map((step, index) => {
            const color = getStepColor(step.status);
            const isExpanded = expandedStep === step.step;
            const isLast = index === timeline.length - 1;

            return (
              <div key={step.step}>
                <div
                  className={`flex gap-4 pb-8 cursor-pointer transition-colors hover:bg-gray-50 px-4 py-2 rounded-lg ${isExpanded ? 'bg-gray-50' : ''}`}
                  onClick={() => toggleStep(step.step)}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${color.dot} flex items-center justify-center text-white relative z-10 flex-shrink-0`}>
                      {getStepIcon(step)}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-16 ${color.line} mt-2`} />
                    )}
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">{step.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{formatDateTime(step.date)}</p>
                      </div>
                      {step.details && (
                        <div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                  </div>
                </div>

                {isExpanded && step.details && (
                  <div className={`ml-14 mb-4 p-4 ${color.bgLight} border border-gray-200 rounded-lg`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(step.details).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-gray-900 mt-1 font-medium">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {holds && holds.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Hold History</h3>
            <div className="space-y-3">
              {holds.map((hold, index) => (
                <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">{hold.title}</h4>
                      <p className="text-sm text-blue-700 mt-1">{hold.reason}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-blue-600 font-medium">Applied:</span>
                          <span className="ml-1 text-blue-700">{formatDate(hold.appliedDate)}</span>
                        </div>
                        {hold.releasedDate && (
                          <div>
                            <span className="text-blue-600 font-medium">Released:</span>
                            <span className="ml-1 text-blue-700">{formatDate(hold.releasedDate)}</span>
                          </div>
                        )}
                        {hold.duration && (
                          <div>
                            <span className="text-blue-600 font-medium">Duration:</span>
                            <span className="ml-1 text-blue-700">{hold.duration} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
