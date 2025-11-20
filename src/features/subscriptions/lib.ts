import { subscriptions, donations } from "@/db/schema";

const DAY_IN_MS = 86_400_000;

export const checkIsActive = (
  subscription: typeof subscriptions.$inferSelect,
) => {
  let active = false;

  if (
    subscription &&
    subscription.priceId &&
    subscription.currentPeriodEnd
  ) {
    active = subscription.currentPeriodEnd.getTime() + DAY_IN_MS > Date.now();
  }

  return active;
};

export const checkIsDonor = (
  donation: typeof donations.$inferSelect | undefined,
) => {
  // If user has made a successful donation, they are a donor
  return !!donation && donation.status === "succeeded";
};
