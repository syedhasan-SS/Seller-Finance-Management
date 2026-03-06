import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ActiveBlocker } from '../types';

interface ActiveBlockersProps {
  blockers: ActiveBlocker[];
}

export default function ActiveBlockers({ blockers }: ActiveBlockersProps) {
  if (blockers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-3">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-fleek-black mb-1">No Active Blockers</h3>
          <p className="text-sm text-gray-500">You're all set! No issues are preventing your payout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-bold text-fleek-black mb-0.5">Active Blockers</h2>
        <p className="text-sm text-gray-500">
          {blockers.length} {blockers.length === 1 ? 'issue' : 'issues'} requiring attention
        </p>
      </div>

      <div className="px-6 pb-6 pt-4 space-y-3">
        {blockers.map((blocker, index) => (
          <div
            key={index}
            className="bg-fleek-yellow-light border border-fleek-yellow rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-fleek-black mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-fleek-black mb-1 text-sm">
                  {blocker.title}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  {blocker.description}
                </p>
                <div className="text-xs text-gray-600 font-medium">
                  Estimated resolution: {blocker.estimatedResolution}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
