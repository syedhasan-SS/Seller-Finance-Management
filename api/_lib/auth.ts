/**
 * Authentication Utilities
 *
 * Provides JWT token generation/validation and password hashing
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Use environment variable or default (change in production!)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-use-long-random-string';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

export interface JWTPayload {
  supplier_id: string;
  supplier_email: string;
  vendor_handle: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for authenticated supplier
 */
export function generateToken(
  supplier_id: string,
  supplier_email: string,
  vendor_handle: string
): string {
  return jwt.sign(
    {
      supplier_id,
      supplier_email,
      vendor_handle,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode JWT token
 * Throws error if invalid or expired
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error: any) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare plain password with hashed password
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
