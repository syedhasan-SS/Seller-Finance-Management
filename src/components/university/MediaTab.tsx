/**
 * Media library tab — upload, alt text, usage counts, delete.
 * Local pilot: blobs in IndexedDB. Production: same UI, blobs in object storage.
 */
import { useEffect, useState } from 'react';
import { useAssetUrl } from './AssetMedia';
import { listAssets, removeAsset, saveAsset, subscribeMedia, updateAssetAlt, type MediaAsset } from './media';
import { listArticles } from './store';

function usageCount(assetId: string): number {
  return listArticles().filter((a) =>
    a.blocks.some((b) => (b.type === 'image' || b.type === 'video') && 'assetId' in b && b.assetId === assetId),
  ).length;
}

function fmtSize(bytes: number): string {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function AssetCard({ asset, readonly }: { asset: MediaAsset; readonly: boolean }) {
  const url = useAssetUrl(asset.id);
  const used = usageCount(asset.id);
  const [alt, setAlt] = useState(asset.alt);

  return (
    <div className="hcm-sidecard" style={{ width: 220, marginBottom: 0 }}>
      <div style={{ height: 120, borderRadius: 8, overflow: 'hidden', background: '#17181C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        {url ? (
          asset.mime.startsWith('video/') ? (
            <video src={url} muted loop autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : asset.mime === 'application/pdf' ? (
            <span style={{ color: '#F6C42D', fontSize: 34 }}>📄</span>
          ) : (
            <img src={url} alt={asset.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )
        ) : (
          <span style={{ color: '#75726A', fontSize: 11 }}>loading…</span>
        )}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={asset.name}>
        {asset.name}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--muted)', margin: '2px 0 6px' }}>
        {asset.mime.split('/')[0]} · {fmtSize(asset.size)} · used in {used} article{used === 1 ? '' : 's'}
      </div>
      <input
        value={alt}
        placeholder="Alt text (required for images)"
        onChange={(e) => setAlt(e.target.value)}
        onBlur={() => alt !== asset.alt && updateAssetAlt(asset.id, alt)}
        style={{ width: '100%', fontSize: 11.5 }}
      />
      {!readonly && (
        <button
          className="hcm-btn hcm-btn--sm hcm-btn--danger"
          style={{ marginTop: 8 }}
          onClick={() => {
            if (used > 0 && !window.confirm(`Used in ${used} article(s) — those blocks will show “missing”. Delete anyway?`)) return;
            removeAsset(asset.id);
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
}

export default function MediaTab({ readonly }: { readonly: boolean }) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = () => listAssets().then(setAssets);
  useEffect(() => {
    refresh();
    return subscribeMedia(refresh);
  }, []);

  return (
    <>
      <div className="hcm-note">
        Images ≤ 4 MB · videos ≤ 50 MB (H.264 720p, silent-demo style) · PDFs ≤ 10 MB. Stored in this browser (IndexedDB) for the pilot;
        on FleekOS the same library uploads to object storage + CDN — nothing about articles changes because blocks
        reference assets by id, not by file.
      </div>
      <div className="hcm-toolbar">
        <label className="hcm-btn" style={{ display: 'inline-block' }}>
            {busy ? 'Uploading…' : '＋ Upload image / video / PDF'}
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,application/pdf"
              multiple
              style={{ display: 'none' }}
              onChange={async (e) => {
                const files = [...(e.target.files ?? [])];
                setBusy(true);
                for (const f of files) {
                  const res = await saveAsset(f);
                  if (!res.ok) window.alert(`${f.name}: ${res.message}`);
                }
                setBusy(false);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      {assets.length === 0 ? (
        <div className="hcm-empty">No media yet. Upload screenshots and silent-demo videos, then attach them to articles from the editor.</div>
      ) : (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} readonly={readonly} />
          ))}
        </div>
      )}
    </>
  );
}
