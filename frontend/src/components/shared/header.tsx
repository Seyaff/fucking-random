import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { env } from "@/config/env";

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Bot className="size-5 text-primary" />
          AgentAI
        </Link>

        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href={`${env.API_URL}/auth/google`}
          >
            <Button>Sign in</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
