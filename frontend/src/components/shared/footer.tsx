import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bot className="size-4" />
            AgentAI
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AgentAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
