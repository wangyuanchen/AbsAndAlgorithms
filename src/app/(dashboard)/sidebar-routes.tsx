"use client";

import { Home, MessageCircleQuestion, Utensils, Info, Shield, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";

import { SidebarItem } from "./sidebar-item";

export const SidebarRoutes = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-y-4 flex-1">
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem href="/" icon={Home} label="Home" isActive={pathname === "/"} />
        <SidebarItem href="/menus" icon={Utensils} label="Menu Generator" isActive={pathname === "/menus"} />
        <SidebarItem href="/subscription" icon={Sparkles} label="Upgrade to Pro" isActive={pathname === "/subscription"} />
      </ul>
      <div className="px-3">
        <Separator />
      </div>
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem href="/about" icon={Info} label="About" isActive={pathname === "/about"} />
        <SidebarItem href="/privacy" icon={Shield} label="Privacy Policy" isActive={pathname === "/privacy"} />
        <SidebarItem
          href="mailto:pgr.sen@gmail.com"
          icon={MessageCircleQuestion}
          label="Get Help"
        />
      </ul>
    </div>
  );
};