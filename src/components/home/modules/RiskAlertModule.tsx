import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { RiskAlertModule as TRiskAlertModule, AlertSeverity } from '@/types/homeConfig';

const STYLE: Record<AlertSeverity, { bg: string; border: string; iconColor: string; Icon: React.ComponentType<{ className?: string }>; cta: string }> = {
  error:   { bg: 'bg-red-50',           border: 'border-red-200',       iconColor: 'text-red-600',   Icon: AlertCircle,
             cta: 'bg-red-600 text-white hover:bg-red-700' },
  warning: { bg: 'bg-fleek-yellow-light', border: 'border-fleek-yellow', iconColor: 'text-fleek-black', Icon: AlertTriangle,
             cta: 'bg-fleek-yellow text-fleek-black hover:bg-fleek-yellow-dark' },
  info:    { bg: 'bg-blue-50',          border: 'border-blue-200',      iconColor: 'text-blue-600',  Icon: Info,
             cta: 'bg-blue-600 text-white hover:bg-blue-700' },
};

export default function RiskAlertModule({ module }: { module: TRiskAlertModule }) {
  const navigate = useNavigate();
  const { severity, title, body, cta } = module.data;
  const s = STYLE[severity];
  const isExternal = cta?.href.startsWith('http');

  return (
    <div className={`${s.bg} ${s.border} border rounded-xl p-4 sm:p-5`}>
      <div className="flex items-start gap-3">
        <s.Icon className={`w-5 h-5 ${s.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-fleek-black mb-1">{title}</h3>
          <p className="text-sm text-gray-700 mb-3">{body}</p>
          {cta && (
            isExternal ? (
              <a
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                data-home-cta="1"
                data-home-href={cta.href}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-colors ${s.cta}`}
              >
                {cta.label}
              </a>
            ) : (
              <button
                onClick={() => navigate(cta.href)}
                data-home-cta="1"
                data-home-href={cta.href}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-colors ${s.cta}`}
              >
                {cta.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
