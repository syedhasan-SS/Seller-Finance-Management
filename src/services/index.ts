/**
 * Unified API Service
 *
 * This service provides a single interface for data fetching
 * that can toggle between different backends:
 * - Sample data (for development/testing)
 * - BigQuery (production)
 * - Supabase (legacy, if needed)
 */

import type { PayoutData, Order, OrderDetailView } from '../types';
import { samplePayoutData } from '../data/sampleData';
import * as bigqueryService from './bigquery';
import * as apiClient from './api-client';

// Configuration
const USE_BIGQUERY = import.meta.env.VITE_USE_BIGQUERY === 'true';

/**
 * Get complete payout data for a seller
 */
export async function getPayoutData(sellerIdOrHandle: string): Promise<PayoutData> {
  if (!USE_BIGQUERY) {
    // Use sample data for development
    console.log('[API] Using sample data');
    return samplePayoutData;
  }

  // Use API client to call backend API (which uses BigQuery)
  console.log('[API] Using BigQuery API for seller:', sellerIdOrHandle);

  // Check if we have a vendor handle or vendor ID
  let vendorId = sellerIdOrHandle;

  // If it looks like a handle (contains letters), look up the ID
  if (/[a-z]/i.test(sellerIdOrHandle)) {
    const id = await apiClient.getVendorId(sellerIdOrHandle);
    if (!id) {
      throw new Error(`Vendor not found: ${sellerIdOrHandle}`);
    }
    vendorId = id;
  }

  return apiClient.getSellerPayoutData(vendorId);
}

/**
 * Get seller's orders
 */
export async function getOrders(
  sellerIdOrHandle: string,
  filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Order[]> {
  if (!USE_BIGQUERY) {
    let orders = samplePayoutData.orders;

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      orders = orders.filter(o => o.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      orders = orders.filter(o =>
        o.orderId.toLowerCase().includes(searchLower) ||
        o.productName?.toLowerCase().includes(searchLower)
      );
    }

    return orders;
  }

  let vendorId = sellerIdOrHandle;
  if (/[a-z]/i.test(sellerIdOrHandle)) {
    const id = await apiClient.getVendorId(sellerIdOrHandle);
    if (!id) throw new Error(`Vendor not found: ${sellerIdOrHandle}`);
    vendorId = id;
  }

  return apiClient.getSellerOrders(vendorId, filters);
}

/**
 * Get order detail
 */
export async function getOrderDetail(orderLineId: string): Promise<OrderDetailView> {
  if (!USE_BIGQUERY) {
    // Return sample order detail
    throw new Error('Order detail not available in sample data mode');
  }

  return bigqueryService.getOrderDetail(orderLineId);
}

/**
 * Get income statements
 */
export async function getIncomeStatements(sellerIdOrHandle: string): Promise<any[]> {
  if (!USE_BIGQUERY) {
    // Return sample income statements
    return [];
  }

  let vendorId = sellerIdOrHandle;
  if (/[a-z]/i.test(sellerIdOrHandle)) {
    const id = await bigqueryService.getVendorId(sellerIdOrHandle);
    if (!id) throw new Error(`Vendor not found: ${sellerIdOrHandle}`);
    vendorId = id;
  }

  return bigqueryService.getIncomeStatements(vendorId);
}

/**
 * Get statement detail
 */
export async function getStatementDetail(payoutId: number, sellerIdOrHandle: string): Promise<any> {
  if (!USE_BIGQUERY) {
    // Return sample statement detail
    return null;
  }

  let vendorId = sellerIdOrHandle;
  if (/[a-z]/i.test(sellerIdOrHandle)) {
    const id = await bigqueryService.getVendorId(sellerIdOrHandle);
    if (!id) throw new Error(`Vendor not found: ${sellerIdOrHandle}`);
    vendorId = id;
  }

  return bigqueryService.getStatementDetail(payoutId, vendorId);
}

// Export configuration for debugging
export const config = {
  useBigQuery: USE_BIGQUERY,
  defaultVendor: import.meta.env.VITE_DEFAULT_VENDOR || 'vibe-vintage',
};
