"use client";

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const MenusSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started</CardTitle>
        <CardDescription>Create your first AI-powered fitness menu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Enter your available ingredients and let AI create a nutritionally balanced menu with detailed recipes
          </p>
          <Link href="/menus">
            <Button size="lg">Generate Menu</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};