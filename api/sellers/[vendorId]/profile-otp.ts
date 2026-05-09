/**
 * POST /api/sellers/:vendorId/profile-otp/send
 * Sends OTP to the new email or phone before updating.
 *
 * POST /api/sellers/:vendorId/profile-otp/verify
 * Verifies OTP and applies the update.
 */

import type { VercelResponse } from '@vercel/node';
import { requireAuth, AuthenticatedRequest } from '../../_lib/auth-middleware';

// In-memory OTP store (replace with Redis/DB in production)
const otpStore = new Map<string, { otp: string; target: string; field: string; expiresAt: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default requireAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { vendorId } = req.query as { vendorId: string };
  const action = (req.query.action as string) || '';

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── SEND OTP ──────────────────────────────────────────────────────────────
  if (action === 'send') {
    const { field, value } = req.body as { field: 'email' | 'phone'; value: string };

    if (!field || !value) {
      return res.status(400).json({ error: 'Bad request', message: '`field` and `value` are required.' });
    }

    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return res.status(400).json({ error: 'Invalid email', message: 'Please provide a valid email address.' });
    }

    const otp = generateOtp();
    const key = `${vendorId}:${field}`;
    otpStore.set(key, {
      otp,
      target: value,
      field,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // TODO: Integrate with email/SMS provider (SendGrid, Twilio) to send real OTP.
    // For Phase 1 MVP, log OTP to console (development only).
    console.log(`[OTP] ${field} OTP for ${vendorId}: ${otp} → ${value}`);

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${value}`,
      // Remove in production:
      ...(process.env.NODE_ENV !== 'production' ? { _debug_otp: otp } : {}),
    });
  }

  // ── VERIFY OTP ────────────────────────────────────────────────────────────
  if (action === 'verify') {
    const { field, otp } = req.body as { field: 'email' | 'phone'; otp: string };

    if (!field || !otp) {
      return res.status(400).json({ error: 'Bad request', message: '`field` and `otp` are required.' });
    }

    const key = `${vendorId}:${field}`;
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({ error: 'No pending verification', message: 'Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ error: 'Code expired', message: 'The verification code has expired. Please request a new one.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid code', message: 'Incorrect verification code. Please try again.' });
    }

    otpStore.delete(key);

    // TODO: Persist the verified field update to operational database.
    console.log(`[OTP] Verified ${field} update for ${vendorId}: ${record.target}`);

    return res.status(200).json({
      success: true,
      field: record.field,
      value: record.target,
      updatedAt: new Date().toISOString(),
    });
  }

  return res.status(400).json({ error: 'Unknown action', message: 'Use ?action=send or ?action=verify' });
});
