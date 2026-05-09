/**
 * Report Helpers
 *
 * Shared utilities for the /api/reports/* endpoints:
 * - Date range computation for weekly / monthly / quarterly periods
 * - BigQuery parameterized query builder
 */

export type ReportPeriod = 'weekly' | 'monthly' | 'quarterly';

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  label: string; // Human-readable label e.g. "Week of 14 Apr 2026"
  prevStart: string; // Previous period start (for trend comparison)
  prevEnd: string;   // Previous period end
}

/**
 * Returns the current and previous date ranges for a given report period.
 * "Current" always ends yesterday (so data is complete).
 */
export function getDateRange(period: ReportPeriod): DateRange {
  const now = new Date();
  // Work in UTC to avoid timezone drift in server environments
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  let start: Date;
  let end: Date;
  let prevStart: Date;
  let prevEnd: Date;
  let label: string;

  if (period === 'weekly') {
    // Mon–Sun of the most recently completed week
    const dayOfWeek = today.getUTCDay(); // 0 = Sun, 1 = Mon …
    const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = addDays(today, -(daysToLastMonday + 7));
    const lastSunday = addDays(lastMonday, 6);

    start = lastMonday;
    end = lastSunday;
    prevStart = addDays(lastMonday, -7);
    prevEnd = addDays(lastSunday, -7);
    label = `Week of ${formatDate(start)}`;
  } else if (period === 'monthly') {
    // Previous full calendar month
    const firstOfThisMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const firstOfLastMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
    const lastOfLastMonth = addDays(firstOfThisMonth, -1);
    const firstOfTwoMonthsAgo = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 2, 1));
    const lastOfTwoMonthsAgo = addDays(firstOfLastMonth, -1);

    start = firstOfLastMonth;
    end = lastOfLastMonth;
    prevStart = firstOfTwoMonthsAgo;
    prevEnd = lastOfTwoMonthsAgo;
    label = formatMonthLabel(start);
  } else {
    // quarterly: previous full calendar quarter
    const q = Math.floor(today.getUTCMonth() / 3); // current quarter index (0-3)
    const year = today.getUTCFullYear();

    const prevQ = q === 0 ? 3 : q - 1;
    const prevQYear = q === 0 ? year - 1 : year;

    start = new Date(Date.UTC(prevQYear, prevQ * 3, 1));
    end = new Date(Date.UTC(prevQYear, prevQ * 3 + 3, 0)); // last day of quarter

    const prevPrevQ = prevQ === 0 ? 3 : prevQ - 1;
    const prevPrevQYear = prevQ === 0 ? prevQYear - 1 : prevQYear;
    prevStart = new Date(Date.UTC(prevPrevQYear, prevPrevQ * 3, 1));
    prevEnd = new Date(Date.UTC(prevPrevQYear, prevPrevQ * 3 + 3, 0));

    label = `Q${prevQ + 1} ${prevQYear}`;
  }

  return {
    start: toISODate(start),
    end: toISODate(end),
    prevStart: toISODate(prevStart),
    prevEnd: toISODate(prevEnd),
    label,
  };
}

// --- Internal helpers ---

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Compute a simple percentage change between two numbers.
 * Returns null if the previous value is zero (avoid division by zero).
 */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Standard error response helper for report endpoints.
 */
export function reportError(res: any, status: number, message: string, detail?: string) {
  console.error(`[Report] ${message}`, detail || '');
  return res.status(status).json({ error: message, detail: detail || null });
}
