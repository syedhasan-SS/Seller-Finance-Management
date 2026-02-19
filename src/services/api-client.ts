/**
 * Frontend API Client
 *
 * HTTP client for calling backend API endpoints.
 * Replaces direct MCP tool calls with HTTP fetch requests.
 */

import type { Order, PayoutData } from '../types';

// API base URL - empty string for relative paths when deployed together on Vercel
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get vendor ID from handle
 */
export async function getVendorId(handle: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/vendors/${handle}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to get vendor: ${handle}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Get seller's orders with optional filters
 */
export async function getSellerOrders(
  vendorId: string,
  filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Order[]> {
  const params = new URLSearchParams();

  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.offset) params.set('offset', String(filters.offset));

  const queryString = params.toString();
  const url = `${API_URL}/api/sellers/${vendorId}/orders${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get orders');
  }

  return response.json();
}

/**
 * Get complete payout data for Dashboard
 */
export async function getSellerPayoutData(vendorId: string): Promise<PayoutData> {
  const response = await fetch(`${API_URL}/api/sellers/${vendorId}/payout`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get payout data');
  }

  const data = await response.json();

  // Get recent orders for the dashboard
  const orders = await getSellerOrders(vendorId, { limit: 10 });

  return {
    ...data,
    orders,
  };
}
