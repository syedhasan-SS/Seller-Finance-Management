import { AlertCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { ActiveBlocker } from '../types';

interface ActiveBlockersProps {
  blockers: ActiveBlocker[];
}

export default function ActiveBlockers({ blockers }: ActiveBlockersProps) {
  const getSeverityConfig = (severity: ActiveBlocker['severity']) => {
    switch (severity) {
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          descColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          descColor: 'text-yellow-700'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          descColor: 'text-blue-700'
        };
    }
  };

  if (blockers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Info className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Blockers</h3>
          <p className="text-gray-600">You're all set! No issues are preventing your payout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Active Blockers</h2>
        <p className="text-sm text-gray-600 mt-1">
          {blockers.length} {blockers.length === 1 ? 'issue' : 'issues'} requiring attention
        </p>
      </div>

      <div className="p-6 space-y-4">
        {blockers.map((blocker, index) => {
          const config = getSeverityConfig(blocker.severity);
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className={`${config.iconColor} mt-0.5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${config.titleColor} mb-2`}>
                    {blocker.title}
                  </h3>
                  <p className={`text-sm ${config.descColor} mb-3`}>
                    {blocker.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className={config.descColor}>
                      <span className="font-medium">Estimated resolution:</span>{' '}
                      {blocker.estimatedResolution}
                    </div>
                    {blocker.actionRequired && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white border border-gray-300 text-gray-700">
                        Action Required
                      </span>
                    )}
                  </div>

                  {blocker.actionButton && (
                    <button
                      onClick={blocker.actionButton.onClick}
                      className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        blocker.severity === 'error'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : blocker.severity === 'warning'
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {blocker.actionButton.label}
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
