/**
 * HTML → blocks converter (browser-side, uses DOMParser).
 * Powers the Zendesk migration and any future "paste rich HTML" import.
 * Images keep their remote src (re-uploaded to the media library during
 * polish); Loom/YouTube iframes become video blocks with embedUrl.
 */
import { sanitizeHtml } from './sanitize';
import type { ArticleBlock } from './data';

const STRUCTURAL = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'UL', 'OL', 'TABLE', 'P', 'DIV', 'SECTION', 'ARTICLE', 'IFRAME', 'IMG', 'HR', 'BLOCKQUOTE', 'FIGURE']);

export function htmlToBlocks(html: string): ArticleBlock[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks: ArticleBlock[] = [];

  const pushText = (raw: string) => {
    const s = sanitizeHtml(raw).trim();
    if (s && s.replace(/&nbsp;|<br\s*\/?>|<div>\s*<\/div>|\s/gi, '') !== '') blocks.push({ type: 'text', html: s });
  };

  const pushImage = (el: Element) => {
    const src = el.getAttribute('src');
    if (src && !src.startsWith('data:')) blocks.push({ type: 'image', assetId: '', alt: el.getAttribute('alt') ?? '', src });
  };

  const pushIframe = (el: Element) => {
    const src = el.getAttribute('src') ?? '';
    if (src) blocks.push({ type: 'video', caption: el.getAttribute('title') || 'Watch the walkthrough', length: '', embedUrl: src });
  };

  const walk = (el: Element) => {
    switch (el.tagName) {
      case 'H1':
      case 'H2':
        blocks.push({ type: 'heading', level: 2, html: sanitizeHtml(el.innerHTML).trim() });
        return;
      case 'H3':
      case 'H4':
      case 'H5':
        blocks.push({ type: 'heading', level: 3, html: sanitizeHtml(el.innerHTML).trim() });
        return;
      case 'UL':
      case 'OL': {
        const items = [...el.querySelectorAll(':scope > li')].map((li) => sanitizeHtml(li.innerHTML).trim()).filter(Boolean);
        if (items.length) blocks.push({ type: 'list', style: el.tagName === 'OL' ? 'number' : 'bullet', items });
        return;
      }
      case 'TABLE': {
        const rows = [...el.querySelectorAll('tr')].map((tr) => [...tr.querySelectorAll('th,td')].map((c) => sanitizeHtml(c.innerHTML).trim()));
        if (rows.length && rows[0].length) blocks.push({ type: 'table', rows });
        return;
      }
      case 'IMG':
        pushImage(el);
        return;
      case 'IFRAME':
        pushIframe(el);
        return;
      case 'HR':
        blocks.push({ type: 'divider' });
        return;
      case 'BLOCKQUOTE': {
        const q = sanitizeHtml(el.innerHTML).trim();
        if (q) blocks.push({ type: 'quote', html: q });
        return;
      }
      default: {
        // Container (p/div/figure/…): pull media out first, recurse into
        // block-level children, otherwise treat as a text paragraph.
        const hasBlockChildren = [...el.children].some((c) => STRUCTURAL.has(c.tagName) && c.tagName !== 'P');
        const media = el.querySelectorAll(':scope img, :scope iframe');
        if (media.length) {
          media.forEach((m) => {
            if (m.tagName === 'IMG') pushImage(m);
            else pushIframe(m);
            m.remove();
          });
          if (hasBlockChildren) [...el.children].forEach(walk);
          else pushText(el.innerHTML);
          return;
        }
        if (hasBlockChildren) {
          [...el.children].forEach(walk);
          return;
        }
        pushText(el.innerHTML);
      }
    }
  };

  [...doc.body.children].forEach(walk);

  // Promote the first substantial paragraph to the "In short" summary card
  const ti = blocks.findIndex((b) => b.type === 'text');
  if (ti >= 0) {
    const t = blocks[ti] as Extract<ArticleBlock, { type: 'text' }>;
    const plain = t.html.replace(/<[^>]+>/g, '').trim();
    if (plain.length > 40) {
      blocks.splice(ti, 1);
      blocks.unshift({ type: 'in_short', text: plain.slice(0, 240) });
    }
  }

  return blocks;
}

/** Best-effort topic assignment from the Zendesk title. Editors re-file during polish. */
export function topicForTitle(title: string): string {
  const t = title.toLowerCase();
  if (/(payout|payment|bank|commission|fee|protected)/.test(t)) return 'Get Paid';
  if (/(shipping|fulfil|weight|process an order|order journey|cancellation)/.test(t)) return 'Ship Orders';
  if (/(listing|grading|inventory|liquidation)/.test(t)) return 'List Products';
  if (/(getting started|sign-up|signup|walkthrough|staff|role based|onboarding)/.test(t)) return 'Start Selling';
  if (/(campaign|discount|offer|chat)/.test(t)) return 'Grow';
  if (/(qc|quality|disintermediation|hold)/.test(t)) return 'Fix a Problem';
  return 'Fix a Problem';
}
