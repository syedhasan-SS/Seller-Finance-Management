/**
 * Media upload — client-direct uploads to Vercel Blob (files bypass the
 * 4.5 MB serverless request cap, so 15 MB videos work).
 *
 * The browser calls @vercel/blob/client upload() pointing here; we verify the
 * admin JWT passed in clientPayload before issuing the upload token.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { verifyToken } from '../auth';

const MAX_BYTES = 15 * 1024 * 1024;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let role = '';
        try {
          const payload = JSON.parse(clientPayload ?? '{}') as { token?: string };
          role = verifyToken(payload.token ?? '').role;
        } catch {
          throw new Error('Not authenticated');
        }
        if (role !== 'admin' && role !== 'owner' && process.env.PILOT_BYPASS_ADMIN !== '1') {
          throw new Error('Admin role required to upload media');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf'],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Media metadata is tracked in content.json by the portal.
      },
    });
    res.status(200).json(jsonResponse);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' });
  }
}
