"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, TriangleAlert, Apple, Dumbbell } from "lucide-react";

import { useSignUp } from "@/features/auth/hooks/use-sign-up";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "@/components/ui/card";

export const SignUpCard = () => {
  const [loading, setLoading] = useState(false);

  const mutation = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onCredentialSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    mutation.mutate(
      {
        name,
        email,
        password,
      },
      {
        onSuccess: () => {
          signIn("credentials", {
            email,
            password,
            callbackUrl: "/",
          });
        },
      }
    );
  };

  return (
    <Card className="w-full h-full p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="size-8 text-green-600" />
          <Apple className="size-8 text-green-600" />
        </div>
        <CardTitle className="text-3xl font-bold text-green-800">Join FitMenu</CardTitle>
        <CardDescription className="text-green-700">Start your personalized fitness nutrition journey today</CardDescription>
      </CardHeader>
      {!!mutation.error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
          <TriangleAlert className="size-4" />
          <p>Something went wrong</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form onSubmit={onCredentialSignUp} className="space-y-2.5">
          <Input
            disabled={mutation.isPending || loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            type="text"
            required
          />
          <Input
            disabled={mutation.isPending || loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <Input
            disabled={mutation.isPending || loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            minLength={3}
            maxLength={20}
          />
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            type="submit"
            size="lg"
            disabled={loading || mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 size-5 top-2.5 left-2.5 animate-spin" />
            ) : (
              "Create My FitMenu Account"
            )}
          </Button>
        </form>
        <p className="text-xs text-green-700">
          Already have an account?{" "}
          <Link href="/sign-in" onClick={() => setLoading(true)}>
            <span className="text-green-600 font-semibold hover:underline">Sign in to FitMenu</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
