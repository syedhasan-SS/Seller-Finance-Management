export interface Order {
  orderId: string;
  completedAt: string;
  eligibilityDate: string;
  status: 'eligible' | 'pending_eligibility' | 'held';
  amount: number;
  holdReasons: string[];
  daysUntilEligible?: number;
}

export interface ActiveBlocker {
  reasonCode: string;
  severity: 'info' | 'warning' | 'error';
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
  status: 'completed' | 'delayed' | 'held';
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
