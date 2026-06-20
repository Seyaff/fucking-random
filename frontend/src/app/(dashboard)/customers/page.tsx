import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your customer base
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">No customers yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Customer profiles will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
