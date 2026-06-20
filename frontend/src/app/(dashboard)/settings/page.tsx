import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and integrations
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Settings className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Settings coming soon</p>
          <p className="text-sm text-muted-foreground mt-1">
            Manage integrations, billing, and team members
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
