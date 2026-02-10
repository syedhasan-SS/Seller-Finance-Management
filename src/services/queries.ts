import { useQuery } from '@tanstack/react-query';
import { payoutService } from './api';

/**
 * Hook to fetch payout data for a seller
 */
export const usePayoutData = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['payoutData', sellerId],
    queryFn: () => payoutService.getPayoutData(sellerId!),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    enabled: !!sellerId
  });
};

/**
 * Hook to fetch order detail
 */
export const useOrderDetail = (orderId: string | null) => {
  return useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: () => payoutService.getOrderDetail(orderId!),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!orderId
  });
};
