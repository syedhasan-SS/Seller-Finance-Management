import { User } from 'lucide-react';

interface HeaderProps {
  sellerId: string;
}

export default function Header({ sellerId }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span className="text-lg font-bold text-gray-900">FLEEK</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-3">
              <div className="text-sm font-medium text-gray-900">{sellerId}</div>
              <div className="text-xs text-gray-500">Seller Account</div>
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
