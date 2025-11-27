'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionStatus } from '@/features/subscriptions/api/use-subscription';
import { toast } from 'sonner';

export function useCheckSubscription(options?: { redirectOnFail?: boolean }) {
  const router = useRouter();
  const { data: subscriptionData, isLoading } = useSubscriptionStatus();
  const { redirectOnFail = true } = options || {};
  
  useEffect(() => {
    if (!isLoading && !subscriptionData?.isSubscribed && redirectOnFail) {
      toast.error('Subscription required to access this feature');
      router.push('/subscription');
    }
  }, [isLoading, subscriptionData, router, redirectOnFail]);
  
  return {
    isSubscribed: subscriptionData?.isSubscribed || false,
    subscriptionData,
    isLoading,
  };
}
