/**
 * HTML sanitizer for rich-text block content.
 * Whitelist approach: only inline formatting tags survive; every attribute
 * except a[href] is stripped; javascript:/data: URLs are removed.
 * Runs on save (editor) — stored block HTML is always clean.
 */

const ALLOWED = new Set(['B', 'I', 'U', 'S', 'EM', 'STRONG', 'A', 'CODE', 'BR', 'DIV', 'SPAN']);

export function sanitizeHtml(html: string): string {
  const root = document.createElement('div');
  root.innerHTML = html;

  // Unwrap disallowed elements (keep their children) until stable
  let dirty = true;
  while (dirty) {
    dirty = false;
    for (const el of root.querySelectorAll('*')) {
      if (!ALLOWED.has(el.tagName)) {
        el.replaceWith(...el.childNodes);
        dirty = true;
        break;
      }
    }
  }

  for (const el of root.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      if (!(el.tagName === 'A' && attr.name === 'href')) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') ?? '';
      if (/^\s*(javascript|data|vbscript):/i.test(href)) el.removeAttribute('href');
    }
  }

  return root.innerHTML;
}

/** Plain-text length of an HTML string (for caps like in_short ≤ 240 chars). */
export function textLength(html: string): number {
  const d = document.createElement('div');
  d.innerHTML = html;
  return (d.textContent ?? '').length;
}
