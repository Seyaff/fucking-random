"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, MessageSquare, Package } from "lucide-react";

const actions = [
  { label: "AI Manager", href: "/agent-manager", icon: Sparkles, color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20" },
  { label: "Test Agent", href: "/agent-test", icon: Bot, color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
  { label: "Inbox", href: "/inbox", icon: MessageSquare, color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
  { label: "Products", href: "/products", icon: Package, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map(({ label, href, icon: Icon, color }) => (
        <Button
          key={label}
          variant="outline"
          asChild
          className={`h-auto flex-col gap-1.5 py-4 border-dashed ${color}`}
        >
          <Link href={href}>
            <Icon className="size-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}
