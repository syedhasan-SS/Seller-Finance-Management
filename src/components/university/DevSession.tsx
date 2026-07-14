/**
 * DEV-ONLY session switcher — /dev/session
 *
 * The real login API is a Vercel function and isn't served by local Vite,
 * so this page fakes the session the same way AuthContext reads it, letting
 * you test every access tier of the Help Center Manager on localhost.
 * Registered in App.tsx only when import.meta.env.DEV — never in a build.
 */
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@/contexts/AuthContext';

const TIERS: { role: UserRole; label: string; expect: string }[] = [
  { role: 'owner', label: 'Owner', expect: 'Full control — everything incl. Delete & Import backup' },
  { role: 'admin', label: 'Admin', expect: 'Full control — everything incl. Delete & Import backup' },
  { role: 'viewer', label: 'Viewer', expect: 'Blocked — "Access denied" screen (not an admin role)' },
  { role: 'vendor', label: 'Vendor (seller)', expect: 'Blocked — sellers never see the manager' },
];

function setSession(role: UserRole) {
  localStorage.setItem('auth_token', 'dev-pilot-token');
  localStorage.setItem('supplier_handle', 'faez');
  localStorage.setItem('supplier_email', 'syed.hasan@joinfleek.com');
  localStorage.setItem('user_name', 'Syed Faez');
  localStorage.setItem('user_role', role);
}

function clearSession() {
  ['auth_token', 'supplier_handle', 'supplier_email', 'user_name', 'user_role'].forEach((k) =>
    localStorage.removeItem(k),
  );
}

export default function DevSession() {
  const navigate = useNavigate();
  const current = localStorage.getItem('auth_token')
    ? `${localStorage.getItem('user_name')} · ${localStorage.getItem('user_role')}`
    : 'logged out';

  const go = () => {
    // full reload so AuthContext re-reads localStorage
    window.location.href = '/tools/help-center';
  };

  return (
    <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', maxWidth: 620, margin: '60px auto', padding: 20 }}>
      <div style={{ background: '#17181C', color: '#F6C42D', display: 'inline-block', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em' }}>
        DEV ONLY · NOT IN PRODUCTION BUILDS
      </div>
      <h1 style={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Access checker</h1>
      <p style={{ color: '#75726A', fontSize: 14 }}>
        Current session: <b style={{ color: '#17181C' }}>{current}</b>. Pick a tier, then the manager opens — verify it
        behaves as expected. (Locally the real login API isn&rsquo;t available; in production this comes from FleekOS
        login + <code>ADMIN_USERS_JSON</code>.)
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <tbody>
          {TIERS.map((t) => (
            <tr key={t.role} style={{ borderTop: '1px solid #E7E5DE' }}>
              <td style={{ padding: '12px 8px 12px 0', whiteSpace: 'nowrap' }}>
                <button
                  onClick={() => {
                    setSession(t.role);
                    go();
                  }}
                  style={{ background: '#F6C42D', border: '1.5px solid #17181C', boxShadow: '2px 2px 0 #17181C', borderRadius: 10, padding: '8px 14px', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  Log in as {t.label}
                </button>
              </td>
              <td style={{ padding: '12px 0', color: '#75726A' }}>{t.expect}</td>
            </tr>
          ))}
          <tr style={{ borderTop: '1px solid #E7E5DE' }}>
            <td style={{ padding: '12px 8px 12px 0' }}>
              <button
                onClick={() => {
                  setSession('vendor');
                  window.location.href = '/tools/help-center?adminBypass=1';
                }}
                style={{ background: '#fff', border: '1.5px solid #17181C', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                Editor tier (bypass)
              </button>
            </td>
            <td style={{ padding: '12px 0', color: '#75726A' }}>
              Write, publish, upload — but no Delete article, no Delete media, no Import backup
            </td>
          </tr>
          <tr style={{ borderTop: '1px solid #E7E5DE' }}>
            <td style={{ padding: '12px 8px 12px 0' }}>
              <button
                onClick={() => {
                  clearSession();
                  go();
                }}
                style={{ background: '#FDE8E3', border: '1.5px solid #E14B32', color: '#E14B32', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                Log out
              </button>
            </td>
            <td style={{ padding: '12px 0', color: '#75726A' }}>Blocked — redirects to /login</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: '#75726A', marginTop: 20 }}>
        Seller side (<button onClick={() => navigate('/university')} style={{ border: 0, background: 'none', color: '#2F6FB6', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, padding: 0 }}>/university</button>) is
        intentionally open in the pilot — in the vendor app it sits behind seller login.
      </p>
    </div>
  );
}
