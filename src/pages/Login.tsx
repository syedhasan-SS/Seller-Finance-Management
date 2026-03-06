import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LoginResponse {
  token: string;
  supplier: {
    id: string;
    handle: string;
  };
}

export default function Login() {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Authentication failed');
      }

      const data: LoginResponse = await response.json();

      // Update AuthContext state (also sets localStorage internally)
      login(data.token, data.supplier.handle, '');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-fleek-black px-16 gap-6">
        <img src="/logo.jpeg" alt="Fleek" className="w-24 h-24 object-contain" />
        <h1 className="text-4xl font-extrabold text-white tracking-widest uppercase">Fleek</h1>
        <p className="text-gray-400 text-center text-sm leading-relaxed max-w-xs">
          Your seller finance portal — track payouts, orders, and income statements in one place.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img src="/logo.jpeg" alt="Fleek" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-extrabold text-fleek-black tracking-widest uppercase">Fleek</span>
          </div>

          <h2 className="text-2xl font-bold text-fleek-black mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Enter your vendor handle to access the portal.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="handle" className="block text-sm font-semibold text-fleek-black mb-1.5">
                Vendor Handle
              </label>
              <input
                id="handle"
                name="handle"
                type="text"
                autoComplete="username"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-fleek-yellow transition font-medium"
                placeholder="your-vendor-handle"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-fleek-black mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-fleek-yellow transition font-medium"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-fleek-yellow text-fleek-black font-bold text-sm rounded-lg hover:bg-fleek-yellow-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide uppercase"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-xs text-gray-400 text-center">
            Pilot mode — enter your vendor handle and any password to access.
          </p>
        </div>
      </div>
    </div>
  );
}
