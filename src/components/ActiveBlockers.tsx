import { Info } from 'lucide-react';
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
            <Info className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Active Blockers</h3>
          <p className="text-sm text-gray-600">You're all set! No issues are preventing your payout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Active Blockers</h2>
        <p className="text-sm text-gray-500">
          {blockers.length} {blockers.length === 1 ? 'issue' : 'issues'} requiring attention
        </p>
      </div>

      <div className="px-6 pb-6 space-y-3">
        {blockers.map((blocker, index) => (
          <div
            key={index}
            className="bg-blue-50 border border-blue-100 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1 text-sm">
                  {blocker.title}
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  {blocker.description}
                </p>
                <div className="text-sm text-blue-600">
                  <span className="font-medium">Estimated resolution:</span>{' '}
                  {blocker.estimatedResolution}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
