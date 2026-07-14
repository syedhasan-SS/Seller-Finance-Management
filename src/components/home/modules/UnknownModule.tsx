import { useEffect } from 'react';
import type { HomeModule } from '@/types/homeConfig';

/**
 * Fallback for module types the renderer doesn't know about. Lets the backend
 * ship a new module type before all clients update without breaking the page.
 */
export default function UnknownModule({ module }: { module: HomeModule }) {
  useEffect(() => {
    console.warn(`[HomepageRenderer] Unknown module type: ${module.type}`, module);
  }, [module]);
  return null;
}
