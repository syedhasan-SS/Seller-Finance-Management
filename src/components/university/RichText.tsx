/**
 * RichText — the Notion-feel inline editor used inside blocks.
 *
 * contentEditable with a formatting toolbar that appears on focus:
 * bold / italic / underline / strikethrough / inline code / link.
 * Notion interactions surface via callbacks the parent wires up:
 *  - Enter (single-line mode)  → onEnter()          — create next block
 *  - Backspace on empty        → onEmptyBackspace() — remove this block
 *  - "/" typed in empty block  → onSlash()          — open block menu
 *
 * Output is sanitized HTML per block — the same contract production keeps.
 */
import { useEffect, useRef, useState } from 'react';
import { sanitizeHtml } from './sanitize';

interface RichTextProps {
  html: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** true = Enter inserts a line break; false (default) = Enter fires onEnter */
  multiline?: boolean;
  onEnter?: () => void;
  onEmptyBackspace?: () => void;
  onSlash?: () => void;
  autoFocus?: boolean;
  className?: string;
}

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export default function RichText({
  html,
  onChange,
  placeholder,
  multiline = false,
  onEnter,
  onEmptyBackspace,
  onSlash,
  autoFocus,
  className,
}: RichTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Set content only when it differs and we're not typing (prevents caret jumps)
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== html && document.activeElement !== el) {
      el.innerHTML = html;
    }
  }, [html]);

  useEffect(() => {
    if (autoFocus) {
      const el = ref.current;
      el?.focus();
      // caret to end
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [autoFocus]);

  const emit = () => {
    const el = ref.current;
    if (el) onChange(sanitizeHtml(el.innerHTML));
  };

  const isEmpty = () => (ref.current?.textContent ?? '').trim() === '';

  const insertCode = () => {
    const sel = window.getSelection();
    const text = sel?.toString();
    if (text) exec('insertHTML', `<code>${text.replace(/</g, '&lt;')}</code>&nbsp;`);
    emit();
  };

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (url && /^https?:\/\//i.test(url)) exec('createLink', url);
    else if (url) window.alert('Links must start with http:// or https://');
    emit();
  };

  return (
    <div className={`hcm-rtwrap ${className ?? ''}`}>
      {focused && (
        <div className="hcm-rtbar" onMouseDown={(e) => e.preventDefault()}>
          <button type="button" title="Bold (Ctrl/Cmd+B)" onClick={() => { exec('bold'); emit(); }}><b>B</b></button>
          <button type="button" title="Italic" onClick={() => { exec('italic'); emit(); }}><i>I</i></button>
          <button type="button" title="Underline" onClick={() => { exec('underline'); emit(); }}><u>U</u></button>
          <button type="button" title="Strikethrough" onClick={() => { exec('strikeThrough'); emit(); }}><s>S</s></button>
          <button type="button" title="Inline code" onClick={insertCode}>{'</>'}</button>
          <button type="button" title="Add link" onClick={addLink}>🔗</button>
          <button type="button" title="Remove link" onClick={() => { exec('unlink'); emit(); }}>⛓️‍💥</button>
          <button type="button" title="Clear formatting" onClick={() => { exec('removeFormat'); exec('unlink'); emit(); }}>⌫</button>
        </div>
      )}
      <div
        ref={ref}
        className="hcm-rt"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder ?? 'Type — “/” for blocks'}
        onInput={emit}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); emit(); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !multiline) {
            e.preventDefault();
            onEnter?.();
            return;
          }
          if (e.key === 'Backspace' && isEmpty() && onEmptyBackspace) {
            e.preventDefault();
            onEmptyBackspace();
            return;
          }
          if (e.key === '/' && isEmpty() && onSlash) {
            e.preventDefault();
            onSlash();
          }
        }}
      />
    </div>
  );
}
