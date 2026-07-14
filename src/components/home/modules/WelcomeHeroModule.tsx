import type { WelcomeHeroModule as TWelcomeHeroModule } from '@/types/homeConfig';

const BADGE_TONE = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
} as const;

export default function WelcomeHeroModule({ module }: { module: TWelcomeHeroModule }) {
  const { greeting, subline, badge } = module.data;
  return (
    <div className="bg-fleek-black rounded-xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-white leading-tight">{greeting}</h1>
          {subline && <p className="text-sm text-gray-400 mt-1 sm:mt-2">{subline}</p>}
        </div>
        {badge && (
          <span
            className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${BADGE_TONE[badge.tone]}`}
          >
            {badge.label}
          </span>
        )}
      </div>
    </div>
  );
}
