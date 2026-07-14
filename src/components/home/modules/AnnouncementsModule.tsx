import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, AlertTriangle, Info, X } from 'lucide-react';
import type {
  AnnouncementsModule as TAnnouncementsModule,
  AlertSeverity,
  Announcement,
} from '@/types/homeConfig';

const STYLE: Record<
  AlertSeverity,
  { bg: string; border: string; iconColor: string; Icon: React.ComponentType<{ className?: string }>; cta: string }
> = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    Icon: AlertTriangle,
    cta: 'bg-red-600 text-white hover:bg-red-700',
  },
  warning: {
    bg: 'bg-fleek-yellow-light',
    border: 'border-fleek-yellow',
    iconColor: 'text-fleek-black',
    Icon: AlertTriangle,
    cta: 'bg-fleek-yellow text-fleek-black hover:bg-fleek-yellow-dark',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    Icon: Info,
    cta: 'bg-blue-600 text-white hover:bg-blue-700',
  },
};

const DISMISSED_KEY = 'fleek_home_dismissed_announcements';

function getDismissed(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function addDismissed(id: string): void {
  try {
    const set = new Set(getDismissed());
    set.add(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* no-op */
  }
}

function AnnouncementBanner({
  a,
  onDismiss,
}: {
  a: Announcement;
  onDismiss: (id: string) => void;
}) {
  const navigate = useNavigate();
  const s = STYLE[a.severity];
  const isExternal = a.cta?.href.startsWith('http');

  return (
    <div className={`${s.bg} ${s.border} border rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <s.Icon className={`w-5 h-5 ${s.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-fleek-black mb-1">{a.title}</h3>
          <p className="text-sm text-gray-700 mb-3">{a.body}</p>
          {a.cta &&
            (isExternal ? (
              <a
                href={a.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                data-home-cta="1"
                data-home-href={a.cta.href}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-colors ${s.cta}`}
              >
                {a.cta.label}
              </a>
            ) : (
              <button
                onClick={() => navigate(a.cta!.href)}
                data-home-cta="1"
                data-home-href={a.cta.href}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-colors ${s.cta}`}
              >
                {a.cta.label}
              </button>
            ))}
        </div>
        {a.dismissible && (
          <button
            onClick={() => onDismiss(a.id)}
            className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-900 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AnnouncementsModule({ module }: { module: TAnnouncementsModule }) {
  const { items } = module.data;
  const [dismissed, setDismissed] = useState<string[]>(() => getDismissed());

  useEffect(() => {
    setDismissed(getDismissed());
  }, []);

  const visible = items.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const handleDismiss = (id: string) => {
    addDismissed(id);
    setDismissed((d) => [...d, id]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Megaphone className="w-4 h-4 text-fleek-black" />
        <span className="text-sm font-semibold text-fleek-black">Announcements</span>
      </div>
      {visible.map((a) => (
        <AnnouncementBanner key={a.id} a={a} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}
