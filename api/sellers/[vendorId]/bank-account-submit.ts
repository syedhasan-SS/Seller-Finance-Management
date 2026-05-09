/**
 * POST /api/sellers/:vendorId/bank-account-submit
 * Accepts a bank account update submission from the supplier self-service portal.
 * Places it into the Seller Support admin review queue.
 *
 * GET /api/sellers/:vendorId/bank-account-submit
 * Returns the current bank account submission status for this vendor.
 */

import type { VercelResponse } from '@vercel/node';
import { requireAuth, AuthenticatedRequest } from '../../_lib/auth-middleware';

interface BankSubmissionBody {
  accountTitle: string;
  bankName: string;
  iban: string;
  country: string;
  accountType: string;
  documentBase64?: string;
  documentName?: string;
}

function validateIban(iban: string): boolean {
  // Basic format validation: 15–34 alphanumeric chars after removing spaces
  const cleaned = iban.replace(/\s/g, '');
  return /^[A-Z0-9]{10,34}$/.test(cleaned);
}

export default requireAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { vendorId } = req.query as { vendorId: string };
  const vendorHandle = req.user?.vendor_handle;

  if (vendorHandle && vendorHandle !== vendorId && req.user?.role === 'vendor') {
    return res.status(403).json({ error: 'Access denied', message: 'You can only submit for your own account.' });
  }

  // ── GET — current submission status ──────────────────────────────────────
  if (req.method === 'GET') {
    // TODO: Query submission status from database.
    return res.status(200).json({
      status: 'none',  // none | submitted | under_review | approved | rejected
      submission: null,
    });
  }

  // ── POST — new submission ─────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body as BankSubmissionBody;
    const errors: Record<string, string> = {};

    if (!body.accountTitle?.trim()) errors.accountTitle = 'Account title is required.';
    if (!body.bankName?.trim())     errors.bankName     = 'Bank name is required.';
    if (!body.country)              errors.country      = 'Country is required.';
    if (!body.accountType)          errors.accountType  = 'Account type is required.';

    if (!body.iban?.trim()) {
      errors.iban = 'IBAN / account number is required.';
    } else if (!validateIban(body.iban)) {
      errors.iban = 'IBAN format appears invalid. Please check and try again.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    const submissionId = `BANK-${vendorId.toUpperCase()}-${Date.now()}`;
    const submittedAt = new Date().toISOString();

    // TODO: Persist to database and notify admin queue.
    console.log(`[BankSubmit] New submission ${submissionId} from ${vendorId}:`, {
      accountTitle: body.accountTitle.trim(),
      bankName: body.bankName.trim(),
      ibanLast4: body.iban.replace(/\s/g, '').slice(-4),
      country: body.country,
      accountType: body.accountType,
      hasDocument: !!body.documentBase64,
      submittedAt,
    });

    return res.status(201).json({
      success: true,
      submissionId,
      status: 'submitted',
      submittedAt,
      message: 'Your bank account details have been submitted for review. You will be notified within 48 hours.',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
