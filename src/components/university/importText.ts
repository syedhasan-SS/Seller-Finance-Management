/**
 * Paste-to-blocks converter for SOP migration.
 * Takes plain text copied from Zendesk / SOP Portal / docs and produces the
 * typed block structure. Heuristics, not perfection — the editor cleans up.
 */
import type { ArticleBlock } from './data';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Bold anything **like this** after escaping. */
const inline = (s: string) => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

const isHeading = (line: string): string | null => {
  const md = line.match(/^#{1,4}\s+(.*)$/);
  if (md) return md[1].trim();
  // "1. What is Sea Shipping..." style section headings (short numbered questions/titles)
  const numbered = line.match(/^\d+[.)]\s+(.{3,80})$/);
  if (numbered && (line.endsWith('?') || /^[A-Z]/.test(numbered[1])) && line.length < 90 && !/[.!]$/.test(line.trim()))
    return numbered[1].trim();
  // Short ALL-CAPS or Title-Case-ish standalone lines
  if (line.length < 60 && line === line.toUpperCase() && /[A-Z]/.test(line)) return line.trim();
  return null;
};

export function textToBlocks(raw: string): { title: string; blocks: ArticleBlock[] } {
  const lines = raw.replace(/\r/g, '').split('\n');
  const blocks: ArticleBlock[] = [];
  let title = '';
  let stepCounter = 0;
  let faqBuffer: { q: string; a: string }[] = [];
  let pendingQ: string | null = null;

  const flushFaq = () => {
    if (pendingQ) {
      faqBuffer.push({ q: pendingQ, a: '' });
      pendingQ = null;
    }
    if (faqBuffer.length) {
      blocks.push({ type: 'faq', items: faqBuffer });
      faqBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (!title) {
      title = line.replace(/^#+\s*/, '');
      continue;
    }

    // Q:/A: pairs → FAQ block
    const qm = line.match(/^Q[:.]?\s+(.*)$/i);
    const am = line.match(/^A[:.]?\s+(.*)$/i);
    if (qm) {
      if (pendingQ) faqBuffer.push({ q: pendingQ, a: '' });
      pendingQ = qm[1];
      continue;
    }
    if (am && pendingQ) {
      faqBuffer.push({ q: pendingQ, a: am[1] });
      pendingQ = null;
      continue;
    }

    const heading = isHeading(line);
    if (heading) {
      flushFaq();
      stepCounter = 0;
      blocks.push({ type: 'section', title: heading });
      continue;
    }

    // Note:/Warning:/⚠ → warning callout
    const warn = line.match(/^(?:note|warning|important|⚠️?)[:\s]+(.*)$/i);
    if (warn) {
      flushFaq();
      blocks.push({ type: 'callout', tone: 'warn', title: 'Note', text: warn[1] });
      continue;
    }

    // "1. do the thing" (longer, imperative) → step
    const stepM = line.match(/^(?:\d+[.)]|Step\s+\d+\s*[—:-])\s*(.*)$/i);
    if (stepM && stepM[1].length > 0) {
      flushFaq();
      stepCounter += 1;
      blocks.push({ type: 'step', n: stepCounter, html: inline(stepM[1]) });
      continue;
    }

    // "- bullet" → text line (kept short)
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      flushFaq();
      blocks.push({ type: 'text', html: `• ${inline(bullet[1])}` });
      continue;
    }

    flushFaq();
    blocks.push({ type: 'text', html: inline(line) });
  }
  flushFaq();

  // First plain-text block becomes the "in short" summary if none exists
  const firstTextIdx = blocks.findIndex((b) => b.type === 'text');
  if (firstTextIdx >= 0 && !blocks.some((b) => b.type === 'in_short')) {
    const first = blocks[firstTextIdx];
    if (first.type === 'text') {
      blocks.splice(firstTextIdx, 1);
      blocks.unshift({ type: 'in_short', text: first.html.replace(/<[^>]+>/g, '').slice(0, 240) });
    }
  }

  return { title: title || 'Untitled SOP', blocks };
}
