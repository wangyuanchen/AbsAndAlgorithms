import { z } from "zod";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const app = new Hono()
  // Create Checkout Session
  .post(
    "/checkout",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        priceId: z.string(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { priceId } = c.req.valid("json");

      if (!auth.token?.id || !auth.token?.email) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const userId = auth.token.id as string;
      const userEmail = auth.token.email as string;

      try {
        // Check if user already has a subscription
        const existingSubscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .limit(1);

        // Check if user already has an active subscription
        if (existingSubscription.length > 0) {
          const sub = existingSubscription[0];
          const isActive = sub.status === "active" && 
                          sub.currentPeriodEnd &&
                          sub.currentPeriodEnd.getTime() > Date.now();
          
          if (isActive) {
            return c.json({ 
              error: "You already have an active subscription",
              subscriptionId: sub.subscriptionId,
              currentPeriodEnd: sub.currentPeriodEnd,
            }, 400);
          }
        }

        let customerId: string;

        if (existingSubscription.length > 0) {
          customerId = existingSubscription[0].customerId;
        } else {
          // Create Stripe customer
          const customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              userId,
            },
          });
          customerId = customer.id;
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          billing_address_collection: "auto",
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
          metadata: {
            userId,
          },
          subscription_data: {
            metadata: {
              userId,
            },
          },
        });

        return c.json({ url: session.url });
      } catch (error) {
        console.error("Checkout error:", error);
        return c.json({ error: "Failed to create checkout session" }, 500);
      }
    },
  )
  // Create Portal Session
  .post(
    "/portal",
    verifyAuth(),
    async (c) => {
      const auth = c.get("authUser");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const userId = auth.token.id as string;

      try {
        // Get user's subscription
        const userSubscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .limit(1);

        if (userSubscription.length === 0) {
          return c.json({ error: "No subscription found" }, 404);
        }

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: userSubscription[0].customerId,
          return_url: process.env.NEXT_PUBLIC_APP_URL!,
        });

        return c.json({ url: portalSession.url });
      } catch (error) {
        console.error("Portal error:", error);
        return c.json({ error: "Failed to create portal session" }, 500);
      }
    },
  )
  // Get subscription status
  .get(
    "/status",
    verifyAuth(),
    async (c) => {
      const auth = c.get("authUser");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const userId = auth.token.id as string;

      try {
        const userSubscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .limit(1);

        if (userSubscription.length === 0) {
          return c.json({ data: { isSubscribed: false } });
        }

        const subscription = userSubscription[0];
        const isActive = subscription.status === "active" && 
                        subscription.currentPeriodEnd &&
                        subscription.currentPeriodEnd.getTime() > Date.now();

        return c.json({
          data: {
            isSubscribed: isActive,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            customerId: subscription.customerId,
            subscriptionId: subscription.subscriptionId,
            priceId: subscription.priceId,
          },
        });
      } catch (error) {
        console.error("Status check error:", error);
        return c.json({ error: "Failed to check subscription status" }, 500);
      }
    },
  )
  // Webhook handler
  .post(
    "/webhook",
    async (c) => {
      const body = await c.req.text();
      const signature = c.req.header("stripe-signature");

      if (!signature) {
        return c.json({ error: "No signature" }, 400);
      }

      try {
        const event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );

        switch (event.type) {
          case "customer.subscription.created":
          case "customer.subscription.updated": {
            const subscription = event.data.object as any;
            const userId = subscription.metadata.userId;

            if (!userId) {
              console.error("No userId in subscription metadata");
              break;
            }

            // Upsert subscription
            const existingSub = await db
              .select()
              .from(subscriptions)
              .where(eq(subscriptions.userId, userId))
              .limit(1);

            const subscriptionData = {
              userId,
              customerId: subscription.customer,
              subscriptionId: subscription.id,
              priceId: subscription.items.data[0].price.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              status: subscription.status,
              updatedAt: new Date(),
            };

            if (existingSub.length > 0) {
              await db
                .update(subscriptions)
                .set(subscriptionData)
                .where(eq(subscriptions.userId, userId));
            } else {
              await db.insert(subscriptions).values({
                ...subscriptionData,
                createdAt: new Date(),
              });
            }
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as any;
            const userId = subscription.metadata.userId;

            if (userId) {
              await db
                .update(subscriptions)
                .set({
                  status: "canceled",
                  updatedAt: new Date(),
                })
                .where(eq(subscriptions.userId, userId));
            }
            break;
          }

          default:
            console.log(`Unhandled event type: ${event.type}`);
        }

        return c.json({ received: true });
      } catch (error) {
        console.error("Webhook error:", error);
        return c.json({ error: "Webhook processing failed" }, 400);
      }
    },
  );

export default app;
