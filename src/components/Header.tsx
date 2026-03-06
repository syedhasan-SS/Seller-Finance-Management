import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  sellerId: string;
}

export default function Header({ sellerId }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-fleek-black border-b border-fleek-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Fleek" className="h-9 w-9 object-contain rounded-sm" />
            <span className="text-xl font-bold text-white tracking-widest uppercase">Fleek</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-white leading-tight">{sellerId}</div>
              <div className="text-xs text-gray-400 leading-tight">Seller Account</div>
            </div>
            <div className="w-px h-8 bg-fleek-gray-700" />
            <button
              className="p-2 text-gray-400 hover:text-fleek-yellow hover:bg-fleek-gray-800 rounded-lg transition-colors"
              title="Account"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-fleek-gray-800 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
