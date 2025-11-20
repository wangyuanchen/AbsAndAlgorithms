import Stripe from "stripe";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

import { checkIsActive, checkIsDonor } from "@/features/subscriptions/lib";

import { stripe } from "@/lib/stripe";
import { db } from "@/db/drizzle";
import { subscriptions, donations } from "@/db/schema";

const app = new Hono()
  .post("/billing", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));

    if (!subscription) {
      return c.json({ error: "No subscription found" }, 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    });

    if (!session.url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: session.url });
  })
  .get("/current", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));

    const [donation] = await db
      .select()
      .from(donations)
      .where(eq(donations.userId, auth.token.id));

    const active = checkIsActive(subscription);
    const isDonor = checkIsDonor(donation);

    return c.json({
      data: {
        subscription: {
          ...subscription,
          active,
        },
        donation: {
          ...donation,
          isDonor,
        },
      },
    });
  })
  .post("/checkout", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=1`,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: auth.token.email || "",
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: auth.token.id,
        type: "subscription",
      },
    });

    const url = session.url;
    
    if (!url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: url });
  })
  .post("/donate", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?donation=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?donation=canceled`,
      payment_method_types: ["card", "paypal"],
      mode: "payment",
      billing_address_collection: "auto",
      customer_email: auth.token.email || "",
      line_items: [
        {
          price: process.env.STRIPE_DONATION_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: auth.token.id,
        type: "donation",
      },
    });

    const url = session.url;
    
    if (!url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: url });
  })
  .post(
    "/webhook",
    async (c) => {
      const body = await c.req.text();
      const signature = c.req.header("Stripe-Signature") as string;

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (error) {
        return c.json({ error: "Invalid signature" }, 400);
      }

      const session = event.data.object as Stripe.Checkout.Session;

      if (event.type === "checkout.session.completed") {
        const metadata = session.metadata;

        if (!metadata?.userId || !metadata?.type) {
          return c.json({ error: "Invalid session" }, 400);
        }

        if (metadata.type === "subscription") {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );

          await db
            .insert(subscriptions)
            .values({
              status: subscription.status,
              userId: metadata.userId,
              subscriptionId: subscription.id,
              customerId: subscription.customer as string,
              priceId: subscription.items.data[0].price.product as string,
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
        } else if (metadata.type === "donation") {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string,
          );

          await db
            .insert(donations)
            .values({
              userId: metadata.userId,
              paymentIntentId: paymentIntent.id,
              customerId: session.customer as string,
              amount: paymentIntent.amount,
              status: paymentIntent.status,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
        }
      }

      if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        if (!session?.metadata?.userId) {
          return c.json({ error: "Invalid session" }, 400);
        }

        await db
          .update(subscriptions)
          .set({
            status: subscription.status,
            currentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscription.id))
      }

      return c.json(null, 200);
    },
  );

export default app;
