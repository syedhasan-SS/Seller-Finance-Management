import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  sellerId: string;
}

export default function Header({ sellerId }: HeaderProps) {
  const { logout, userName, role } = useAuth();

  const displayName = userName || sellerId;

  return (
    <header className="sticky top-0 z-50 bg-fleek-black border-b border-fleek-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img src="/logo.jpeg" alt="Fleek" className="h-7 w-7 sm:h-9 sm:w-9 object-contain rounded-sm" />
            <span className="text-base sm:text-xl font-bold text-white tracking-widest uppercase">Fleek</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* User info — hide on very small screens */}
            <div className="hidden xs:block text-right">
              <div className="text-xs sm:text-sm font-semibold text-white leading-tight truncate max-w-[120px] sm:max-w-none">
                {displayName}
              </div>
              <div className="text-xs text-gray-400 leading-tight capitalize">{role || 'Seller Account'}</div>
            </div>

            <div className="hidden xs:block w-px h-6 sm:h-8 bg-fleek-gray-700" />

            <button
              className="p-1.5 sm:p-2 text-gray-400 hover:text-fleek-yellow hover:bg-fleek-gray-800 rounded-lg transition-colors"
              title="Account"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={logout}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-fleek-gray-800 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
