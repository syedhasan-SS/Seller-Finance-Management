import { useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * Detects whether /home is running inside a native host (Vendor App WebView)
 * vs as a standalone web portal page.
 *
 * Activation rules (any of):
 *   1. `?embed=1` query param
 *   2. window is iframed (window.parent !== window)
 *   3. localStorage `fleek_home_embed = '1'` (persists across navigations inside the embed)
 *
 * In embed mode:
 *   - Header chrome and DEV debug strip are hidden
 *   - Outer padding shrinks so the page sits flush inside the host
 *   - Navigation events broadcast via window.parent.postMessage so the native
 *     host can deep-link instead of (or in addition to) WebView navigation
 */
export interface EmbedEvent {
  type:
    | 'home.ready'
    | 'home.cta.click'
    | 'home.task.completed'
    | 'home.alert.dismiss'
    | 'home.module.impression';
  href?: string;
  moduleId?: string;
  taskId?: string;
  /** Optional payload reserved for module-specific data. */
  data?: Record<string, unknown>;
}

const STORAGE_KEY = 'fleek_home_embed';

export function useEmbedMode() {
  const isEmbed = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('embed') === '1' || params.get('embed') === 'true') {
        window.localStorage.setItem(STORAGE_KEY, '1');
        return true;
      }
      if (window.localStorage.getItem(STORAGE_KEY) === '1') return true;
      if (window.parent && window.parent !== window) return true;
    } catch {
      // localStorage may throw in sandboxed iframes — fall through.
    }
    return false;
  }, []);

  const emitRef = useRef<((event: EmbedEvent) => void) | null>(null);
  emitRef.current = useCallback(
    (event: EmbedEvent) => {
      if (!isEmbed || typeof window === 'undefined') return;
      const message = { source: 'fleek-home', version: 1, ...event };
      try {
        // Post to parent for iframe embeds.
        window.parent?.postMessage(message, '*');
      } catch {
        /* no-op */
      }
      try {
        // Post to native WebView bridges. ReactNativeWebView (RN) and webkit.messageHandlers (iOS native).
        const w = window as unknown as {
          ReactNativeWebView?: { postMessage: (m: string) => void };
          webkit?: { messageHandlers?: { fleekHome?: { postMessage: (m: unknown) => void } } };
        };
        w.ReactNativeWebView?.postMessage(JSON.stringify(message));
        w.webkit?.messageHandlers?.fleekHome?.postMessage(message);
      } catch {
        /* no-op */
      }
    },
    [isEmbed]
  );

  // Stable emit function reference.
  const emit = useCallback((event: EmbedEvent) => emitRef.current?.(event), []);

  // Broadcast `home.ready` once on mount in embed mode.
  useEffect(() => {
    if (isEmbed) emit({ type: 'home.ready' });
  }, [isEmbed, emit]);

  return { isEmbed, emit };
}
