"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  MessageSquare,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  Bot,
  Menu,
  X,
  Cable,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessagesSquare,
} from "lucide-react";

const navItems = [
  { href: "/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/agent-manager", label: "AI Manager", icon: Sparkles },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/agent-test", label: "Test Agent", icon: Bot },
  { href: "/connectors", label: "Connectors", icon: Cable },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/quick-replies", label: "Quick Replies", icon: MessagesSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          title={collapsed ? label : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
            collapsed
              ? "justify-center px-0 py-2.5 mx-auto size-10"
              : "px-3 py-2",
            pathname.startsWith(href)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="size-4 shrink-0" />
          {!collapsed && label}
        </Link>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex md:flex-col md:border-r md:bg-sidebar md:p-3 transition-all duration-300 ease-in-out",
          collapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <div className={cn("flex items-center mb-6", collapsed ? "justify-center" : "gap-2 px-2")}>
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold shrink-0">
            R
          </div>
          {!collapsed && <span className="font-semibold text-lg">Relay</span>}
        </div>

        <div className="flex-1">
          <SidebarContent collapsed={collapsed} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 size-8 self-center text-muted-foreground hover:text-foreground"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-40 md:hidden"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                R
              </div>
              <span className="font-semibold text-lg">Relay</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
