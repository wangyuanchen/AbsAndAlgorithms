"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Loader, LogOut, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserButton = () => {
  const session = useSession();

  if (session.status === "loading") {
    return <Loader className="size-4 animate-spin text-muted-foreground" />
  }

  if (session.status === "unauthenticated" || !session.data) {
    return (
      <Button 
        variant="default" 
        size="sm" 
        className="bg-green-600 hover:bg-green-700"
        asChild
      >
        <Link href="/sign-in">
          <LogIn className="size-4 mr-2" />
          Sign In
        </Link>
      </Button>
    );
  }

  const name = session.data?.user?.name!;
  const imageUrl = session.data?.user?.image;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="size-10 hover:opacity-75 transition">
          <AvatarImage alt={name} src={imageUrl || ""} />
          <AvatarFallback className="bg-blue-500 font-medium text-white flex items-center justify-center">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem className="h-10" onClick={() => signOut({ callbackUrl: '/sign-in' })}>
          <LogOut className="size-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};