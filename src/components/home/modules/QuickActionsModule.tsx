import { useNavigate } from 'react-router-dom';
import type { QuickActionsModule as TQuickActionsModule, QuickActionItem, QuickActionTone } from '@/types/homeConfig';
import { resolveIcon } from '../iconMap';

const TONE: Record<QuickActionTone, { iconBox: string; iconColor: string }> = {
  yellow:  { iconBox: 'bg-fleek-yellow',       iconColor: 'text-fleek-black' },
  black:   { iconBox: 'bg-fleek-black',        iconColor: 'text-fleek-yellow' },
  neutral: { iconBox: 'bg-gray-100',           iconColor: 'text-fleek-black' },
};

function ActionCard({ action }: { action: QuickActionItem }) {
  const navigate = useNavigate();
  const Icon = resolveIcon(action.icon, 'Package');
  const tone = TONE[action.tone ?? 'neutral'];
  return (
    <button
      onClick={() => navigate(action.href)}
      data-home-cta="1"
      data-home-href={action.href}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-fleek-yellow transition-all text-left group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${tone.iconBox} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${tone.iconColor}`} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-fleek-black leading-tight">{action.label}</h3>
          {action.sublabel && (
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{action.sublabel}</p>
          )}
        </div>
      </div>
    </button>
  );
}

export default function QuickActionsModule({ module }: { module: TQuickActionsModule }) {
  const { title, actions } = module.data;
  return (
    <div>
      {title && (
        <h2 className="text-base sm:text-lg font-bold text-fleek-black mb-3">{title}</h2>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((a) => (
          <ActionCard key={a.id} action={a} />
        ))}
      </div>
    </div>
  );
}
