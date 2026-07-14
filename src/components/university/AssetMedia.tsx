/**
 * Renders media-library assets inside articles.
 * AssetVideo implements the "silent demo" spec: autoplay, muted, loop,
 * plays inline like a GIF; tap for fullscreen. Respects reduced motion.
 */
import { useEffect, useRef, useState } from 'react';
import { getAssetUrl } from './media';

export function useAssetUrl(id?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    if (!id) {
      setUrl(undefined);
      return;
    }
    getAssetUrl(id).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [id]);
  return url;
}

export function AssetImg({ assetId, alt }: { assetId: string; alt: string }) {
  const url = useAssetUrl(assetId);
  if (!url) return <div className="uni-shot" style={{ margin: '8px 0' }}>image missing from library</div>;
  return <img src={url} alt={alt} style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)', display: 'block' }} />;
}

export function AssetPdf({ assetId, src, caption }: { assetId?: string; src?: string; caption?: string }) {
  const resolved = useAssetUrl(assetId);
  const url = assetId ? resolved : src;
  if (!url) return <div className="uni-shot" style={{ margin: '8px 0' }}>PDF missing from library</div>;
  return (
    <div className="uni-vid" style={{ background: '#fff' }}>
      <iframe src={url} title={caption ?? 'PDF document'} style={{ width: '100%', height: 380, border: 0, display: 'block' }} />
      <div className="uni-vcap" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1 }}>📄 {caption ?? 'Document'}</span>
        <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'underline' }}>
          Open full PDF ⤢
        </a>
      </div>
    </div>
  );
}

export function AssetVideo({ assetId, caption, length }: { assetId: string; caption: string; length: string }) {
  const url = useAssetUrl(assetId);
  const ref = useRef<HTMLVideoElement>(null);
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!url) return <div className="uni-shot" style={{ margin: '8px 0' }}>video missing from library</div>;

  return (
    <div className="uni-vid">
      <div style={{ position: 'relative', background: '#000' }}>
        <video
          ref={ref}
          src={url}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          controls={reducedMotion}
          style={{ width: '100%', display: 'block', maxHeight: 260, cursor: 'pointer' }}
          onClick={() => ref.current?.requestFullscreen?.()}
          aria-label={caption}
        />
        <span className="uni-ptag uni-ptag--l">🔇 silent demo · {length}</span>
        <span className="uni-ptag uni-ptag--r">⤢ tap for full screen</span>
      </div>
      <div className="uni-vcap">{caption}</div>
    </div>
  );
}
