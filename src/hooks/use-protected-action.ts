import { useSession } from "next-auth/react";
import { useSubscriptionStatus } from "@/features/subscriptions/api/use-subscription";
import { toast } from "sonner";

interface UseProtectedActionOptions {
  requireSubscription?: boolean;
}

export const useProtectedAction = (options: UseProtectedActionOptions = {}) => {
  const { requireSubscription = false } = options;
  const { data: session, status } = useSession();
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useSubscriptionStatus();

  const checkAccess = () => {
    // Check authentication
    if (status === "unauthenticated" || !session) {
      toast.error("Authentication required", {
        description: "Please sign in to continue",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/sign-in",
        },
      });
      return false;
    }

    // Check subscription if required
    if (requireSubscription) {
      if (isSubscriptionLoading) {
        toast.error("Checking subscription status...");
        return false;
      }

      if (!subscriptionData?.isSubscribed) {
        toast.error("Subscription required", {
          description: "Please subscribe to access this feature",
          action: {
            label: "Subscribe",
            onClick: () => window.location.href = "/subscription",
          },
        });
        return false;
      }
    }

    return true;
  };

  return { checkAccess, isAuthenticated: status === "authenticated", isSubscriptionLoading };
};