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
          // Define active statuses according to Stripe documentation
          const activeStatuses = ['active', 'trialing'];
          const isActive = activeStatuses.includes(existingSubscription.status) && 
                          existingSubscription.currentPeriodEnd &&
                          new Date(existingSubscription.currentPeriodEnd).getTime() > Date.now();
          
          if (isActive) {
            return c.json({ 
              error: "You already have an active subscription",
              subscriptionId: existingSubscription.subscriptionId,
              currentPeriodEnd: existingSubscription.currentPeriodEnd,
              status: existingSubscription.status
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

        const activeStatuses = ['active', 'trialing'];
        const isActive = activeStatuses.includes(userSubscription.status);

        return c.json({
          data: {
            isSubscribed: isActive,
            status: userSubscription.status,
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
        // Validate webhook secret
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
          console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
          return c.json({ error: "Webhook configuration error" }, 500);
        }

        const event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );

        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as any;
            const userId = session.metadata?.userId;

            console.log("Processing checkout session completed:", {
              sessionId: session.id,
              userId: userId,
              customerId: session.customer,
              status: session.status
            });

            if (!userId) {
              console.error("No userId in session metadata", session);
              break;
            }

            // 获取订阅信息（如果有的话）
            if (session.subscription) {
              try {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                
                const supabase = await createClient();
                
                // 安全处理日期值
                let currentPeriodEnd: string | null = null;
                if (subscription.current_period_end) {
                  try {
                    currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
                  } catch (dateError) {
                    console.error("Error parsing current_period_end:", dateError);
                    currentPeriodEnd = null;
                  }
                }

                const subscriptionData = {
                  userId,
                  customerId: subscription.customer as string,
                  subscriptionId: subscription.id,
                  priceId: subscription.items.data[0].price.id,
                  status: subscription.status,
                  updatedAt: new Date().toISOString(),
                };

                console.log("Subscription data from checkout session:", subscriptionData);

                // 检查订阅是否已存在
                const { data: existingSub, error: fetchError } = await supabase
                  .from('subscription')
                  .select('*')
                  .eq('userId', userId)
                  .single();

                if (existingSub) {
                  const { error: updateError } = await supabase
                    .from('subscription')
                    .update(subscriptionData)
                    .eq('userId', userId);
                  
                  if (updateError) {
                    console.error("Failed to update subscription:", updateError);
                  } else {
                    console.log("Subscription updated successfully for user:", userId);
                  }
                } else {
                  const { error: insertError } = await supabase
                    .from('subscription')
                    .insert({
                      ...subscriptionData,
                      createdAt: new Date().toISOString(),
                    });
                  
                  if (insertError) {
                    console.error("Failed to insert subscription:", insertError);
                  } else {
                    console.log("Subscription created successfully for user:", userId);
                  }
                }
              } catch (error) {
                console.error("Error retrieving subscription:", error);
              }
            }
            break;
          }

          case "invoice.payment_succeeded": {
            const invoice = event.data.object as any;
            const subscriptionId = invoice.subscription;
            
            console.log("Processing invoice payment succeeded:", {
              invoiceId: invoice.id,
              subscriptionId: subscriptionId,
              customerId: invoice.customer
            });

            if (subscriptionId) {
              try {
                // 获取最新的订阅信息
                const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
                const userId = subscription.metadata?.userId;
                
                if (!userId) {
                  console.error("No userId in subscription metadata", subscription);
                  break;
                }

                const supabase = await createClient();
                
                // 安全处理日期值
                let currentPeriodEnd: string | null = null;
                if (subscription.current_period_end) {
                  try {
                    currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
                  } catch (dateError) {
                    console.error("Error parsing current_period_end:", dateError);
                    currentPeriodEnd = null;
                  }
                }

                const subscriptionData = {
                  userId,
                  customerId: subscription.customer as string,
                  subscriptionId: subscription.id,
                  priceId: subscription.items.data[0].price.id,
                  status: subscription.status,
                  updatedAt: new Date().toISOString(),
                };

                console.log("Subscription data from invoice payment:", subscriptionData);

                // 更新订阅信息
                const { data: existingSub, error: fetchError } = await supabase
                  .from('subscription')
                  .select('*')
                  .eq('userId', userId)
                  .single();

                if (existingSub) {
                  const { error: updateError } = await supabase
                    .from('subscription')
                    .update(subscriptionData)
                    .eq('userId', userId);
                  
                  if (updateError) {
                    console.error("Failed to update subscription:", updateError);
                  } else {
                    console.log("Subscription updated successfully for user:", userId);
                  }
                } else {
                  const { error: insertError } = await supabase
                    .from('subscription')
                    .insert({
                      ...subscriptionData,
                      createdAt: new Date().toISOString(),
                    });
                  
                  if (insertError) {
                    console.error("Failed to insert subscription:", insertError);
                  } else {
                    console.log("Subscription created successfully for user:", userId);
                  }
                }
              } catch (error) {
                console.error("Error retrieving subscription:", error);
              }
            }
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as any;
            const subscriptionId = invoice.subscription;
            
            console.log("Processing invoice payment failed:", {
              invoiceId: invoice.id,
              subscriptionId: subscriptionId,
              customerId: invoice.customer,
              status: invoice.status
            });

            if (subscriptionId) {
              try {
                // 获取最新的订阅信息
                const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
                const userId = subscription.metadata?.userId;
                
                if (!userId) {
                  console.error("No userId in subscription metadata", subscription);
                  break;
                }

                const supabase = await createClient();
                
                // 安全处理日期值
                let currentPeriodEnd: string | null = null;
                if (subscription.current_period_end) {
                  try {
                    currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
                  } catch (dateError) {
                    console.error("Error parsing current_period_end:", dateError);
                    currentPeriodEnd = null;
                  }
                }

                const subscriptionData = {
                  userId,
                  customerId: subscription.customer as string,
                  subscriptionId: subscription.id,
                  priceId: subscription.items.data[0].price.id,
                  status: subscription.status, // 通常是 past_due 或 unpaid
                  updatedAt: new Date().toISOString(),
                };

                console.log("Subscription data from failed payment:", subscriptionData);

                // 更新订阅信息
                const { error: updateError } = await supabase
                  .from('subscription')
                  .update(subscriptionData)
                  .eq('userId', userId);
                
                if (updateError) {
                  console.error("Failed to update subscription after payment failure:", updateError);
                } else {
                  console.log("Subscription updated successfully after payment failure for user:", userId);
                }
              } catch (error) {
                console.error("Error retrieving subscription after payment failure:", error);
              }
            }
            break;
          }

          case "customer.subscription.created":
          case "customer.subscription.updated": {
            const subscription = event.data.object as any;
            const userId = subscription.metadata?.userId;

            console.log("Processing subscription event:", event.type, {
              subscriptionId: subscription.id,
              userId: userId,
              customerId: subscription.customer,
              status: subscription.status,
              currentPeriodEnd: subscription.current_period_end
            });

            if (!userId) {
              console.error("No userId in subscription metadata", subscription);
              break;
            }

            const supabase = await createClient();
            
            // Check if subscription exists
            const { data: existingSub, error: fetchError } = await supabase
              .from('subscription')
              .select('*')
              .eq('userId', userId)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') {  // PGRST116 is 'Record not found'
              console.error("Database fetch error:", fetchError);
              break;
            }

            // 安全处理日期值
            let currentPeriodEnd: string | null = null;
            if (subscription.current_period_end) {
              try {
                currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
              } catch (dateError) {
                console.error("Error parsing current_period_end:", dateError);
                currentPeriodEnd = null;
              }
            }

            const subscriptionData = {
              userId,
              customerId: subscription.customer,
              subscriptionId: subscription.id,
              priceId: subscription.items?.data?.[0]?.price?.id || '',
              status: subscription.status,
              updatedAt: new Date().toISOString(),
            };

            console.log("Subscription data to save:", subscriptionData);

            if (existingSub) {
              const { error: updateError } = await supabase
                .from('subscription')
                .update(subscriptionData)
                .eq('userId', userId);
              
              if (updateError) {
                console.error("Failed to update subscription:", updateError);
              } else {
                console.log("Subscription updated successfully for user:", userId);
              }
            } else {
              const { error: insertError } = await supabase
                .from('subscription')
                .insert({
                  ...subscriptionData,
                  createdAt: new Date().toISOString(),
                });
              
              if (insertError) {
                console.error("Failed to insert subscription:", insertError);
              } else {
                console.log("Subscription created successfully for user:", userId);
              }
            }
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as any;
            const userId = subscription.metadata?.userId;

            console.log("Processing subscription deletion:", {
              subscriptionId: subscription.id,
              userId: userId,
              currentPeriodEnd: subscription.current_period_end
            });

            if (userId) {
              const supabase = await createClient();
              
              const { error: updateError } = await supabase
                .from('subscription')
                .update({
                  status: "canceled",
                  updatedAt: new Date().toISOString(),
                })
                .eq('userId', userId);
              
              if (updateError) {
                console.error("Failed to cancel subscription:", updateError);
              } else {
                console.log("Subscription canceled successfully for user:", userId);
              }
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
