export interface Order {
  orderId: string;
  orderNumber?: number;
  internalOrderId?: string;
  productName?: string;
  customerName?: string;
  completedAt: string;
  eligibilityDate: string | null;
  status: 'eligible' | 'pending_eligibility' | 'held' | 'paid';
  amount: number;
  qcStatus?: string;
  ffStatus?: string;
  holdReasons?: string[];
  daysUntilEligible?: number;
}

export interface ActiveBlocker {
  reasonCode: string;
  severity: 'low' | 'medium' | 'high' | 'info' | 'warning' | 'error';
  title: string;
  description: string;
  actionRequired: boolean;
  estimatedResolution: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export interface TrustScoreDriver {
  factor: string;
  impact: number;
  description: string;
}

export interface TrustScore {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  topDrivers: TrustScoreDriver[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface PayoutHistoryItem {
  payoutDate: string;
  amount: number;
  status: 'completed' | 'delayed' | 'held' | 'pending' | 'failed';
  orderCount: number;
}

export interface PayoutData {
  sellerId: string;
  currentCycle: string;
  estimatedPayoutDate: string;
  confidence: 'high' | 'medium' | 'low';
  totalAmount: number;
  daysUntilPayout: number;
  orders: Order[];
  activeBlockers: ActiveBlocker[];
  trustScore: TrustScore;
  payoutHistory: PayoutHistoryItem[];
}

export interface TimelineStep {
  step: string;
  title: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
  description: string;
  icon: string;
  details?: Record<string, string | number>;
}

export interface OrderHold {
  holdType: string;
  title: string;
  appliedDate: string;
  releasedDate?: string;
  duration?: number;
  reason: string;
  severity: 'info' | 'warning' | 'error';
}

export interface KeyDate {
  milestone: string;
  date: string;
  daysFromStart: number;
}

export interface OrderDetailView {
  orderId: string;
  amount: number;
  currentStatus: 'paid' | 'eligible' | 'pending' | 'held';
  completedDate: string;
  timeline: TimelineStep[];
  holds: OrderHold[];
  orderDetails: {
    productName: string;
    sku: string;
    category: string;
    returnWindowDays: number;
    qcReviewer: string;
    payoutCycle: string;
    bankAccountLast4: string;
  };
  keyDates: KeyDate[];
}

// BigQuery-specific types

export interface VendorPayoutRow {
  order_line_id: number;
  order_number: number;
  internal_order_id: string;
  title: string; // product name
  vendor_id: number;
  vendor: string; // vendor handle
  customer_name: string;
  vbp_gbp: number; // vendor base price
  price_adjusted: number;
  discount: number;
  qc_status: string;
  qc_time: string | null;
  ff_status: string;
  ff_time: string | null;
  supplier_impact: number;
  to_be_paid: string; // status
  created_at: string;
}

export interface BalanceTransaction {
  id: number;
  order_line_id: string;
  payout_id: number | null;
  destination_id: string;
  base_price_smallest_unit: number;
  final_base_smallest_unit: number;
  commission_percentage: number;
  shipping_amount_smallest_unit: number;
  chargeable_shipping_smallest_unit: number;
  cancellation_fee_smallest_unit: number;
  refund_amount_smallest_unit: number;
  discount_amount_smallest_unit: number;
  previously_paid_smallest_unit: number;
  total_smallest_unit: number;
  total_adjustment_smallest_unit: number;
  total_payable_smallest_unit: number;
  status: 'eligible' | 'pending_eligibility' | 'held' | 'paid' | 'failed' | 'cancelled';
  created_at: string;
  _fivetran_deleted: boolean;
}

export interface PayoutRecord {
  id: number;
  destination_type: string;
  destination_id: string;
  amount_smallest_unit: number;
  currency: string;
  status: string;
  created_at: string;
  _fivetran_deleted: boolean;
}
