import { useNavigate } from 'react-router-dom';
import { Bell, Package, Wallet, User, Info } from 'lucide-react';
import type { NotificationsModule as TNotificationsModule, NotificationKind } from '@/types/homeConfig';

const ICON_FOR: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  order: Package,
  payout: Wallet,
  profile: User,
  system: Info,
};

function formatTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'Today';
  if (days < 2) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return iso.slice(0, 10);
}

export default function NotificationsModule({ module }: { module: TNotificationsModule }) {
  const navigate = useNavigate();
  const { title, items, emptyState } = module.data;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
        <Bell className="w-4 h-4 text-fleek-black" />
        <h2 className="text-base sm:text-lg font-bold text-fleek-black">{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-gray-500">
          {emptyState ?? 'You are all caught up.'}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((n) => {
            const Icon = ICON_FOR[n.kind] ?? Info;
            const clickable = !!n.href;
            return (
              <li
                key={n.id}
                data-home-cta={clickable ? '1' : undefined}
                data-home-href={n.href}
                className={`px-6 py-3 flex items-start gap-3 ${clickable ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                onClick={() => n.href && navigate(n.href)}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-fleek-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-fleek-black leading-snug">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatTime(n.timestamp)}</p>
                </div>
                {n.unread && (
                  <span className="flex-shrink-0 mt-2 w-2 h-2 bg-fleek-yellow rounded-full" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
