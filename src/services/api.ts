import { supabase } from './supabase';
import type { PayoutData, Order, OrderDetailView, ActiveBlocker, TrustScore, PayoutHistoryItem } from '../types';

export const payoutService = {
  /**
   * Fetch complete payout data for a seller
   */
  async getPayoutData(sellerId: string): Promise<PayoutData> {
    const [orders, blockers, trustScore, history] = await Promise.all([
      this.getOrders(sellerId),
      this.getActiveBlockers(sellerId),
      this.getTrustScore(sellerId),
      this.getPayoutHistory(sellerId)
    ]);

    // Calculate current cycle and estimated payout date
    const currentCycle = this.calculateCurrentCycle();
    const estimatedPayoutDate = this.calculatePayoutDate(currentCycle);

    const eligibleOrders = orders.filter(o => o.status === 'eligible');
    const totalAmount = eligibleOrders.reduce((sum, o) => sum + o.amount, 0);

    return {
      sellerId,
      currentCycle,
      estimatedPayoutDate,
      confidence: this.calculateConfidence(orders, blockers),
      totalAmount,
      daysUntilPayout: this.calculateDaysUntilPayout(estimatedPayoutDate),
      orders,
      activeBlockers: blockers,
      trustScore,
      payoutHistory: history
    };
  },

  /**
   * Fetch orders for upcoming payout
   */
  async getOrders(sellerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', sellerId)
      .in('status', ['eligible', 'pending_eligibility', 'held'])
      .order('eligibility_date', { ascending: true });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return (data || []).map(order => ({
      orderId: order.order_id,
      completedAt: order.completed_at,
      eligibilityDate: order.eligibility_date,
      status: order.status as Order['status'],
      amount: parseFloat(order.amount?.toString() || '0'),
      holdReasons: order.hold_reasons || [],
      daysUntilEligible: order.days_until_eligible || undefined
    }));
  },

  /**
   * Fetch active blockers for a seller
   */
  async getActiveBlockers(sellerId: string): Promise<ActiveBlocker[]> {
    const { data, error } = await supabase
      .from('active_blockers')
      .select('*')
      .eq('seller_id', sellerId)
      .is('resolved_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blockers:', error);
      throw error;
    }

    return (data || []).map(blocker => ({
      reasonCode: blocker.reason_code,
      severity: blocker.severity as 'info' | 'warning' | 'error',
      title: blocker.title,
      description: blocker.description,
      actionRequired: blocker.action_required || false,
      estimatedResolution: blocker.estimated_resolution || ''
    }));
  },

  /**
   * Fetch latest trust score for a seller
   */
  async getTrustScore(sellerId: string): Promise<TrustScore> {
    const { data, error } = await supabase
      .from('trust_scores')
      .select('*')
      .eq('seller_id', sellerId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching trust score:', error);
      // Return default trust score if not found
      return {
        score: 0,
        riskLevel: 'medium',
        topDrivers: [],
        trend: 'stable'
      };
    }

    return {
      score: data.score,
      riskLevel: data.risk_level as 'low' | 'medium' | 'high',
      topDrivers: data.top_drivers || [],
      trend: data.trend as 'improving' | 'stable' | 'declining'
    };
  },

  /**
   * Fetch payout history for a seller
   */
  async getPayoutHistory(sellerId: string): Promise<PayoutHistoryItem[]> {
    const { data, error } = await supabase
      .from('payout_history')
      .select('*')
      .eq('seller_id', sellerId)
      .order('payout_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching payout history:', error);
      throw error;
    }

    return (data || []).map(payout => ({
      payoutDate: payout.payout_date,
      amount: parseFloat(payout.amount?.toString() || '0'),
      status: payout.status as 'completed' | 'delayed' | 'held',
      orderCount: payout.order_count
    }));
  },

  /**
   * Fetch detailed order view with timeline
   */
  async getOrderDetail(orderId: string): Promise<OrderDetailView> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw orderError;
    }

    const { data: timeline, error: timelineError } = await supabase
      .from('order_timeline_events')
      .select('*')
      .eq('order_id', orderId)
      .order('event_date', { ascending: true });

    if (timelineError) {
      console.error('Error fetching timeline:', timelineError);
      throw timelineError;
    }

    const timelineSteps = (timeline || []).map(event => ({
      step: event.step,
      title: event.title,
      date: event.event_date,
      status: event.status as 'completed' | 'current' | 'pending',
      description: event.description,
      icon: event.icon,
      details: event.details
    }));

    return {
      orderId: order.order_id,
      amount: parseFloat(order.amount?.toString() || '0'),
      currentStatus: order.status,
      completedDate: order.completed_at,
      timeline: timelineSteps,
      holds: [],
      orderDetails: {
        productName: order.product_name || 'Unknown Product',
        sku: order.sku || 'N/A',
        category: order.category || 'N/A',
        returnWindowDays: 7,
        qcReviewer: 'Pending',
        payoutCycle: 'Weekly',
        bankAccountLast4: '****'
      },
      keyDates: this.calculateKeyDates(timelineSteps)
    };
  },

  // Helper methods
  calculateCurrentCycle(): string {
    // Calculate the current payout cycle date (e.g., every Friday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    return nextFriday.toISOString().split('T')[0];
  },

  calculatePayoutDate(cycleDate: string): string {
    // Add 3 processing days to cycle date
    const cycle = new Date(cycleDate);
    cycle.setDate(cycle.getDate() + 3);
    return cycle.toISOString().split('T')[0];
  },

  calculateConfidence(orders: Order[], blockers: ActiveBlocker[]): 'high' | 'medium' | 'low' {
    if (blockers.some(b => b.severity === 'error')) return 'low';
    if (blockers.some(b => b.severity === 'warning')) return 'medium';
    if (orders.some(o => o.status === 'held')) return 'medium';
    return 'high';
  },

  calculateDaysUntilPayout(payoutDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const payout = new Date(payoutDate);
    payout.setHours(0, 0, 0, 0);
    const diff = payout.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  calculateKeyDates(timeline: any[]): Array<{ milestone: string; date: string; daysFromStart: number }> {
    const keyDates: Array<{ milestone: string; date: string; daysFromStart: number }> = [];

    if (timeline.length === 0) return keyDates;

    const startDate = new Date(timeline[0]?.date || new Date());

    timeline.forEach((event) => {
      if (event.status === 'completed' || event.status === 'current') {
        const eventDate = new Date(event.date);
        const diffTime = eventDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        keyDates.push({
          milestone: event.title,
          date: event.date,
          daysFromStart: diffDays
        });
      }
    });

    return keyDates;
  }
};
