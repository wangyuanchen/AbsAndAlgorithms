import { z } from "zod";
import { Hono } from "hono";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";
import { createClient } from "@/lib/supabase/server";
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
        // Validate Stripe configuration
        if (!process.env.STRIPE_SECRET_KEY) {
          console.error("Missing STRIPE_SECRET_KEY environment variable");
          return c.json({ error: "Payment configuration error" }, 500);
        }
        
        if (!process.env.NEXT_PUBLIC_APP_URL) {
          console.error("Missing NEXT_PUBLIC_APP_URL environment variable");
          return c.json({ error: "App configuration error" }, 500);
        }

        const supabase = await createClient();
        
        // Check if user already has a subscription
        const { data: existingSubscription } = await supabase
          .from('subscription')
          .select('*')
          .eq('userId', userId)
          .single();

        // Check if user already has an active subscription
        if (existingSubscription) {
          const isActive = existingSubscription.status === "active" && 
                          existingSubscription.currentPeriodEnd &&
                          new Date(existingSubscription.currentPeriodEnd).getTime() > Date.now();
          
          if (isActive) {
            return c.json({ 
              error: "You already have an active subscription",
              subscriptionId: existingSubscription.subscriptionId,
              currentPeriodEnd: existingSubscription.currentPeriodEnd,
            }, 400);
          }
        }

        let customerId: string;

        if (existingSubscription) {
          customerId = existingSubscription.customerId;
        } else {
          // Create Stripe customer
          let customer;
          try {
            customer = await stripe.customers.create({
              email: userEmail,
              metadata: {
                userId,
              },
            });
          } catch (stripeError: any) {
            console.error("Failed to create Stripe customer:", stripeError);
            return c.json({ 
              error: "Failed to initialize payment session", 
              details: stripeError.message 
            }, 500);
          }
          customerId = customer.id;
        }

        // Create checkout session
        let session;
        try {
          session = await stripe.checkout.sessions.create({
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
        } catch (stripeError: any) {
          console.error("Failed to create checkout session:", stripeError);
          return c.json({ 
            error: "Failed to create checkout session", 
            details: stripeError.message 
          }, 500);
        }

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
        const supabase = await createClient();
        
        // Get user's subscription
        const { data: userSubscription } = await supabase
          .from('subscription')
          .select('*')
          .eq('userId', userId)
          .single();

        if (!userSubscription) {
          return c.json({ error: "No subscription found" }, 404);
        }

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: userSubscription.customerId,
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
        const supabase = await createClient();
        
        const { data: userSubscription } = await supabase
          .from('subscription')
          .select('*')
          .eq('userId', userId)
          .single();

        if (!userSubscription) {
          return c.json({ data: { isSubscribed: false } });
        }

        const isActive = userSubscription.status === "active" && 
                        userSubscription.currentPeriodEnd &&
                        new Date(userSubscription.currentPeriodEnd).getTime() > Date.now();

        return c.json({
          data: {
            isSubscribed: isActive,
            status: userSubscription.status,
            currentPeriodEnd: userSubscription.currentPeriodEnd,
            customerId: userSubscription.customerId,
            subscriptionId: userSubscription.subscriptionId,
            priceId: userSubscription.priceId,
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

            const supabase = await createClient();
            
            // Check if subscription exists
            const { data: existingSub } = await supabase
              .from('subscription')
              .select('*')
              .eq('userId', userId)
              .single();

            const subscriptionData = {
              userId,
              customerId: subscription.customer,
              subscriptionId: subscription.id,
              priceId: subscription.items.data[0].price.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
              status: subscription.status,
              updatedAt: new Date().toISOString(),
            };

            if (existingSub) {
              await supabase
                .from('subscription')
                .update(subscriptionData)
                .eq('userId', userId);
            } else {
              await supabase
                .from('subscription')
                .insert({
                  ...subscriptionData,
                  createdAt: new Date().toISOString(),
                });
            }
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as any;
            const userId = subscription.metadata.userId;

            if (userId) {
              const supabase = await createClient();
              
              await supabase
                .from('subscription')
                .update({
                  status: "canceled",
                  updatedAt: new Date().toISOString(),
                })
                .eq('userId', userId);
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
