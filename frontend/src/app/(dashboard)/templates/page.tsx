import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage response templates
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">No templates yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first template to speed up responses
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
