/**
 * Media library — local pilot implementation on IndexedDB.
 *
 * Files (images, videos) don't fit in localStorage, so blobs live in
 * IndexedDB (browser quota: hundreds of MB). Blocks reference assets by id —
 * the same contract production keeps, where the blob moves to object storage
 * (Supabase Storage / S3+CDN behind FleekOS) and the id stays identical.
 * Migration = one-click push of every blob to the upload API.
 */

import { addRemoteMedia, isOnline, listRemoteMedia, removeRemoteMedia, updateRemoteMediaAlt } from './store';

export interface MediaAsset {
  id: string;
  name: string;
  mime: string;
  size: number;
  alt: string;
  createdAt: string;
  /** Set for assets whose file lives on Vercel Blob (production mode). */
  url?: string;
}

interface StoredAsset extends MediaAsset {
  blob: Blob;
}

const DB_NAME = 'fleek-hc-media';
const STORE = 'assets';
const EVENT = 'uni-media-changed';

export const MAX_VIDEO_BYTES = 15 * 1024 * 1024; // 15 MB — PRD rule
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
export const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

const notify = () => window.dispatchEvent(new Event(EVENT));

export function subscribeMedia(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export async function saveAsset(file: File, alt = ''): Promise<{ ok: true; asset: MediaAsset } | { ok: false; message: string }> {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  if (!isVideo && !isImage && !isPdf) return { ok: false, message: 'Only images, videos and PDFs are supported.' };
  if (isVideo && file.size > MAX_VIDEO_BYTES) return { ok: false, message: 'Video too large — max 15 MB (compress to H.264 720p).' };
  if (isImage && file.size > MAX_IMAGE_BYTES) return { ok: false, message: 'Image too large — max 4 MB.' };
  if (isPdf && file.size > MAX_PDF_BYTES) return { ok: false, message: 'PDF too large — max 10 MB.' };

  // Production mode: upload straight to Vercel Blob; metadata syncs via content doc
  if (isOnline()) {
    try {
      const { upload } = await import('@vercel/blob/client');
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/help-center/upload',
        clientPayload: JSON.stringify({ token: localStorage.getItem('auth_token') }),
      });
      const asset: MediaAsset = {
        id: `m-${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        name: file.name,
        mime: file.type,
        size: file.size,
        alt,
        createdAt: new Date().toISOString(),
        url: blob.url,
      };
      addRemoteMedia({ ...asset, url: blob.url });
      notify();
      return { ok: true, asset };
    } catch (err) {
      return { ok: false, message: `Upload failed: ${err instanceof Error ? err.message : 'unknown error'}` };
    }
  }

  const asset: StoredAsset = {
    id: `m-${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    name: file.name,
    mime: file.type,
    size: file.size,
    alt,
    createdAt: new Date().toISOString(),
    blob: file,
  };
  await tx('readwrite', (s) => s.put(asset));
  notify();
  const { blob: _blob, ...meta } = asset;
  void _blob;
  return { ok: true, asset: meta };
}

export async function listAssets(): Promise<MediaAsset[]> {
  const local = await tx<StoredAsset[]>('readonly', (s) => s.getAll() as IDBRequest<StoredAsset[]>);
  const localMeta = local.map(({ blob: _blob, ...meta }) => {
    void _blob;
    return meta as MediaAsset;
  });
  const remote = listRemoteMedia() as MediaAsset[];
  const remoteIds = new Set(remote.map((r) => r.id));
  return [...remote, ...localMeta.filter((m) => !remoteIds.has(m.id))].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function getAssetBlob(id: string): Promise<Blob | undefined> {
  const rec = await tx<StoredAsset | undefined>('readonly', (s) => s.get(id) as IDBRequest<StoredAsset | undefined>);
  return rec?.blob;
}

export async function updateAssetAlt(id: string, alt: string) {
  if (listRemoteMedia().some((m) => m.id === id)) {
    updateRemoteMediaAlt(id, alt);
    notify();
    return;
  }
  const rec = await tx<StoredAsset | undefined>('readonly', (s) => s.get(id) as IDBRequest<StoredAsset | undefined>);
  if (!rec) return;
  await tx('readwrite', (s) => s.put({ ...rec, alt }));
  notify();
}

export async function removeAsset(id: string) {
  if (listRemoteMedia().some((m) => m.id === id)) {
    removeRemoteMedia(id); // blob file becomes an orphan — acceptable for pilot
    notify();
    return;
  }
  await tx('readwrite', (s) => s.delete(id));
  urlCache.get(id) && URL.revokeObjectURL(urlCache.get(id)!);
  urlCache.delete(id);
  notify();
}

/** Object-URL cache so repeated renders don't leak. */
const urlCache = new Map<string, string>();

export async function getAssetUrl(id: string): Promise<string | undefined> {
  const remote = listRemoteMedia().find((m) => m.id === id);
  if (remote) return remote.url; // CDN URL, no object-URL needed
  const hit = urlCache.get(id);
  if (hit) return hit;
  const blob = await getAssetBlob(id);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}
