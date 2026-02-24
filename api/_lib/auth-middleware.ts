/**
 * Authentication Middleware
 *
 * Protects API endpoints by verifying JWT tokens
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, JWTPayload } from './auth';

/**
 * Extended request with authenticated user info
 */
export interface AuthenticatedRequest extends VercelRequest {
  user?: JWTPayload;
}

/**
 * Middleware wrapper that requires valid JWT authentication
 *
 * Usage:
 *   export default requireAuth(async (req, res) => {
 *     const supplierId = req.user.supplier_id; // Available after auth
 *     // ... your endpoint logic
 *   });
 */
export function requireAuth(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No token provided. Please log in.',
        });
      }

      // Extract token (remove "Bearer " prefix)
      const token = authHeader.substring(7);

      // Verify and decode token
      const decoded = verifyToken(token);

      // Attach user info to request
      req.user = decoded;

      // Call the actual handler
      return handler(req, res);
    } catch (error: any) {
      console.error('[Auth Middleware] Authentication failed:', error.message);
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message || 'Invalid or expired token',
      });
    }
  };
}
