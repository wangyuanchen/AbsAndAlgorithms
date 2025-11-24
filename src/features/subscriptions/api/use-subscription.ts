import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const response = await client.api.subscriptions.status.$get();
      
      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }

      const { data } = await response.json();
      return data;
    },
  });
};

export const useCreateCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priceId: string) => {
      const response = await client.api.subscriptions.checkout.$post({
        json: { priceId },
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      return url;
    },
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      }
    },
  });
};

export const useCreatePortal = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await client.api.subscriptions.portal.$post();

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      return url;
    },
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      }
    },
  });
};
