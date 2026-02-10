import { PayoutData, OrderDetailView } from '../types';

export const samplePayoutData: PayoutData = {
  sellerId: "SEL-789",
  currentCycle: "2026-02-14",
  estimatedPayoutDate: "2026-02-17",
  confidence: "high",
  totalAmount: 350.00,
  daysUntilPayout: 3,
  orders: [
    {
      orderId: "ORD-001",
      completedAt: "2026-01-20",
      eligibilityDate: "2026-02-03",
      status: "eligible",
      amount: 150.00,
      holdReasons: []
    },
    {
      orderId: "ORD-002",
      completedAt: "2026-01-28",
      eligibilityDate: "2026-02-11",
      status: "pending_eligibility",
      amount: 200.00,
      holdReasons: ["RETURN_WINDOW"],
      daysUntilEligible: 8
    }
  ],
  activeBlockers: [
    {
      reasonCode: "RETURN_WINDOW",
      severity: "info",
      title: "Return Window Active",
      description: "Order ORD-002 is still in the return period. We'll include it in your payout on Feb 11 if no return is requested.",
      actionRequired: false,
      estimatedResolution: "8 days"
    }
  ],
  trustScore: {
    score: 72,
    riskLevel: "medium",
    topDrivers: [
      {
        factor: "dispatch_delays",
        impact: -15,
        description: "3 late dispatches in last 14 days"
      },
      {
        factor: "qc_fail_rate",
        impact: -8,
        description: "12% QC fail rate vs 5% baseline"
      },
      {
        factor: "bank_change_recent",
        impact: -5,
        description: "Bank changed 6 days ago"
      }
    ],
    trend: "declining"
  },
  payoutHistory: [
    {
      payoutDate: "2026-02-03",
      amount: 425.00,
      status: "completed",
      orderCount: 3
    },
    {
      payoutDate: "2026-01-27",
      amount: 380.00,
      status: "completed",
      orderCount: 2
    },
    {
      payoutDate: "2026-01-20",
      amount: 315.00,
      status: "completed",
      orderCount: 2
    },
    {
      payoutDate: "2026-01-13",
      amount: 560.00,
      status: "completed",
      orderCount: 4
    },
    {
      payoutDate: "2026-01-06",
      amount: 290.00,
      status: "delayed",
      orderCount: 2
    }
  ]
};

export const sampleOrderDetails: Record<string, OrderDetailView> = {
  "ORD-001": {
    orderId: "ORD-001",
    amount: 150.00,
    currentStatus: "paid",
    completedDate: "2026-01-20T14:30:00Z",
    timeline: [
      {
        step: "order_completed",
        title: "Order Completed",
        date: "2026-01-20T14:30:00Z",
        status: "completed",
        description: "Customer received and confirmed delivery",
        icon: "package-check",
        details: {
          confirmedBy: "Customer",
          deliveryMethod: "Standard Shipping"
        }
      },
      {
        step: "qc_approved",
        title: "QC Approved",
        date: "2026-01-22T10:15:00Z",
        status: "completed",
        description: "Quality check passed - no issues found",
        icon: "check-circle",
        details: {
          reviewer: "QC-Team-Alpha",
          reviewTime: "1.5 days",
          result: "Passed"
        }
      },
      {
        step: "eligible_for_payout",
        title: "Eligible for Payout",
        date: "2026-02-03T00:00:00Z",
        status: "completed",
        description: "Return window ended (14 days)",
        icon: "calendar-check",
        details: {
          returnWindow: "14 days",
          payoutCycle: "2026-02-14",
          reason: "Standard return period completed"
        }
      },
      {
        step: "payout_processed",
        title: "Payout Processed",
        date: "2026-02-17T09:00:00Z",
        status: "completed",
        description: "Transferred to bank account ****1234",
        icon: "dollar-sign",
        details: {
          bankAccount: "****1234",
          processingTime: "3 business days",
          payoutCycleDate: "2026-02-14"
        }
      }
    ],
    holds: [],
    orderDetails: {
      productName: "Wireless Headphones XYZ",
      sku: "PROD-123456",
      category: "Electronics",
      returnWindowDays: 14,
      qcReviewer: "QC-Team-Alpha",
      payoutCycle: "2026-02-14",
      bankAccountLast4: "1234"
    },
    keyDates: [
      { milestone: "Order Completed", date: "2026-01-20", daysFromStart: 0 },
      { milestone: "QC Approved", date: "2026-01-22", daysFromStart: 2 },
      { milestone: "Became Eligible", date: "2026-02-03", daysFromStart: 14 },
      { milestone: "Payout Cycle", date: "2026-02-14", daysFromStart: 25 },
      { milestone: "Payout Sent", date: "2026-02-17", daysFromStart: 28 }
    ]
  },
  "ORD-002": {
    orderId: "ORD-002",
    amount: 200.00,
    currentStatus: "pending",
    completedDate: "2026-01-28T11:45:00Z",
    timeline: [
      {
        step: "order_completed",
        title: "Order Completed",
        date: "2026-01-28T11:45:00Z",
        status: "completed",
        description: "Customer received and confirmed delivery",
        icon: "package-check",
        details: {
          confirmedBy: "Customer",
          deliveryMethod: "Standard Shipping"
        }
      },
      {
        step: "qc_approved",
        title: "QC Approved",
        date: "2026-01-30T14:20:00Z",
        status: "completed",
        description: "Quality check passed with minor notes",
        icon: "check-circle",
        details: {
          reviewer: "QC-Team-Beta",
          reviewTime: "2 days",
          result: "Passed"
        }
      },
      {
        step: "return_window",
        title: "Return Window Active",
        date: "2026-01-28T11:45:00Z",
        status: "current",
        description: "Order is in the 14-day return period",
        icon: "clock",
        details: {
          returnWindow: "14 days",
          releasedOn: "2026-02-11",
          daysRemaining: "8 days"
        }
      },
      {
        step: "eligible_for_payout",
        title: "Eligible for Payout",
        date: "2026-02-11T00:00:00Z",
        status: "pending",
        description: "Return window will end on this date",
        icon: "calendar-check",
        details: {
          returnWindow: "14 days",
          payoutCycle: "2026-02-14",
          reason: "Standard return period will complete"
        }
      },
      {
        step: "payout_processed",
        title: "Payout Processed",
        date: "2026-02-17T09:00:00Z",
        status: "pending",
        description: "Will be transferred to bank account ****1234",
        icon: "dollar-sign",
        details: {
          bankAccount: "****1234",
          expectedProcessingTime: "3 business days",
          payoutCycleDate: "2026-02-14"
        }
      }
    ],
    holds: [
      {
        holdType: "RETURN_WINDOW",
        title: "Return Window Hold",
        appliedDate: "2026-01-28T11:45:00Z",
        releasedDate: "2026-02-11T00:00:00Z",
        duration: 14,
        reason: "Standard return period for electronics category",
        severity: "info"
      }
    ],
    orderDetails: {
      productName: "Gaming Mouse Pro",
      sku: "PROD-789123",
      category: "Electronics",
      returnWindowDays: 14,
      qcReviewer: "QC-Team-Beta",
      payoutCycle: "2026-02-14",
      bankAccountLast4: "1234"
    },
    keyDates: [
      { milestone: "Order Completed", date: "2026-01-28", daysFromStart: 0 },
      { milestone: "QC Approved", date: "2026-01-30", daysFromStart: 2 },
      { milestone: "Became Eligible", date: "2026-02-11", daysFromStart: 14 },
      { milestone: "Payout Cycle", date: "2026-02-14", daysFromStart: 17 },
      { milestone: "Payout Sent", date: "2026-02-17", daysFromStart: 20 }
    ]
  }
};
