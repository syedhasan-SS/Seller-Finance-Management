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
 * Get auth headers with JWT token
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Handle API response with automatic 401 redirect
 */
async function handleResponse(response: Response) {
  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('supplier_handle');
    localStorage.removeItem('supplier_email');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

/**
 * Get vendor ID from handle
 */
export async function getVendorId(handle: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/vendors/${handle}`, {
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
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

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * Get complete payout data for Dashboard
 */
export async function getSellerPayoutData(vendorId: string): Promise<PayoutData> {
  const response = await fetch(`${API_URL}/api/sellers/${vendorId}/payout`, {
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);

  // Get recent orders for the dashboard
  const orders = await getSellerOrders(vendorId, { limit: 10 });

  return {
    ...data,
    orders,
  };
}
