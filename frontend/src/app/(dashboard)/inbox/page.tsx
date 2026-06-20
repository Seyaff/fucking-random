import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          All your conversations in one place
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Connect WhatsApp, Gmail, or Slack to get started
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
