"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptionStatus, useCreateCheckout, useCreatePortal } from "@/features/subscriptions/api/use-subscription";

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { data: subscriptionData, isLoading } = useSubscriptionStatus();
  const createCheckout = useCreateCheckout();
  const createPortal = useCreatePortal();

  useEffect(() => {
    if (searchParams?.get("success")) {
      setShowSuccess(true);
    }
  }, [searchParams]);

  const handleSubscribe = () => {
    // Replace with your actual Stripe Price ID
    createCheckout.mutate(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "");
  };

  const handleManageBilling = () => {
    createPortal.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="size-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Check className="size-8 text-green-600" />
              <CardTitle className="text-2xl text-green-800">Subscription Successful!</CardTitle>
            </div>
            <CardDescription>
              Welcome to FitMenu AI Pro! You can now generate unlimited AI nutrition plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleManageBilling}
              className="bg-green-600 hover:bg-green-700"
            >
              Manage Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (subscriptionData?.isSubscribed) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-green-800">Active Subscription</CardTitle>
            <CardDescription>
              You have access to unlimited AI menu generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="size-5" />
              <span>Status: Active</span>
            </div>
            <div className="text-sm text-gray-600">
              Your subscription is active and renews automatically.
            </div>
            <Button 
              onClick={handleManageBilling}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Manage Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Upgrade to FitMenu AI Pro
        </h1>
        <p className="text-xl text-gray-600">
          Get unlimited AI-powered nutrition plans
        </p>
      </div>

      <Card className="max-w-md mx-auto border-2 border-green-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-6 text-green-600" />
            <CardTitle className="text-2xl text-green-800">Pro Plan</CardTitle>
          </div>
          <CardDescription>
            <span className="text-3xl font-bold text-green-700">$20</span>
            <span className="text-gray-600"> / month</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Check className="size-5 text-green-600 mt-0.5" />
              <span>Unlimited AI menu generation</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-5 text-green-600 mt-0.5" />
              <span>Personalized macro calculations</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-5 text-green-600 mt-0.5" />
              <span>Detailed recipes with instructions</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-5 text-green-600 mt-0.5" />
              <span>Save and manage your menus</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-5 text-green-600 mt-0.5" />
              <span>Priority customer support</span>
            </li>
          </ul>

          <Button
            onClick={handleSubscribe}
            disabled={createCheckout.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
          >
            {createCheckout.isPending ? (
              <>
                <Loader className="size-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Subscribe Now"
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Cancel anytime. No questions asked.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
