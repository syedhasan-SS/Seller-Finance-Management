/**
 * Synchronous auth bootstrap. Must run BEFORE React mounts so AuthProvider and
 * ProtectedRoute see the seeded token on their first read.
 *
 * Reads `#token=...&vendor=...&role=...&name=...&email=...` from the URL hash,
 * persists fields to localStorage (matching the existing AuthContext keys),
 * then strips the hash from the URL so the token doesn't leak via history /
 * referrer.
 *
 * Hash format mirrors OAuth implicit grant convention. Used by the Vendor App
 * WebView to hand the SSO token to the Webportal /home without a separate web
 * login round-trip.
 *
 * No-op if no hash present.
 */
export function bootstrapAuthFromHash(): void {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const token = params.get('token');
  if (!token) return;

  try {
    window.localStorage.setItem('auth_token', token);
    const vendor = params.get('vendor');
    const role = params.get('role') ?? 'vendor';
    const name = params.get('name');
    const email = params.get('email');
    if (vendor) window.localStorage.setItem('supplier_handle', vendor);
    if (email) window.localStorage.setItem('supplier_email', email);
    if (name) window.localStorage.setItem('user_name', name);
    window.localStorage.setItem('user_role', role);
  } catch {
    /* localStorage may be unavailable in sandboxed iframes; ignore. */
  }

  try {
    const url = new URL(window.location.href);
    url.hash = '';
    window.history.replaceState({}, '', url.toString());
  } catch {
    /* no-op */
  }
}
