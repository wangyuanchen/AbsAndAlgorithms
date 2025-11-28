"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, TriangleAlert, Apple, Dumbbell } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "@/components/ui/card";

export const SignInCard = () => {
  const [loading, setLoading] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const params = useSearchParams();
  const error = params.get("error");

  const onCredentialSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoadingLogin(true);

    signIn("credentials", {
      email: email,
      password: password,
      callbackUrl: "/",
    }).then(() => {
      // Reset loading states after sign in attempt
      setLoading(false);
      setLoadingLogin(false);
    });
  };

  return (
    <Card className="w-full h-full p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="size-8 text-green-600" />
          <Apple className="size-8 text-green-600" />
        </div>
        <CardTitle className="text-3xl font-bold text-green-800">Welcome Back to FitMenu</CardTitle>
        <CardDescription className="text-green-700">Log in to access your personalized fitness nutrition plans</CardDescription>
      </CardHeader>
      {!!error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
          <TriangleAlert className="size-4" />
          <p>Invalid email or password</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form onSubmit={onCredentialSignIn} className="space-y-2.5">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            disabled={loading || loadingLogin}
            required
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            disabled={loading || loadingLogin}
            required
          />
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" type="submit" size="lg" disabled={loading || loadingLogin}>
            {loadingLogin ? (
              <Loader2 className="mr-2 size-5 top-2.5 left-2.5 animate-spin" />
            ) : (
              "Start Your Fitness Journey"
            )}
          </Button>
        </form>
        <p className="text-xs text-green-700">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" onClick={() => setLoading(true)}>
            <span className="text-green-600 font-semibold hover:underline">Join FitMenu Today</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
