"use client";

import { useState } from "react";
import {
  useProtocols,
  useCreateProtocol,
  useUpdateProtocol,
  useDeleteProtocol,
} from "@/hooks/use-protocols";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Bot, Sparkles } from "lucide-react";
import type { Protocol, ProtocolCategory } from "@/types/protocol";

const CATEGORIES: ProtocolCategory[] = [
  "general",
  "products",
  "orders",
  "shipping",
  "returns",
  "escalation",
  "tone",
];

export default function AgentManagerPage() {
  const { data: protocols = [], isLoading } = useProtocols();
  const { mutateAsync: createProtocol, isPending: creating } = useCreateProtocol();
  const { mutateAsync: updateProtocol } = useUpdateProtocol();
  const { mutateAsync: deleteProtocol } = useDeleteProtocol();

  const [title, setTitle] = useState("");
  const [rule, setRule] = useState("");
  const [category, setCategory] = useState<ProtocolCategory>("general");

  const handleCreate = async () => {
    if (!title.trim() || !rule.trim()) return;
    await createProtocol({ title: title.trim(), rule: rule.trim(), category, priority: 50 });
    setTitle("");
    setRule("");
    setCategory("general");
  };

  const toggleActive = async (protocol: Protocol) => {
    await updateProtocol({ id: protocol._id, isActive: !protocol.isActive });
  };

  const handleDelete = async (id: string) => {
    await deleteProtocol(id);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="size-6 text-primary" />
          AI Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Train your WhatsApp agent with business rules in plain English. These protocols are loaded on every customer message.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a protocol</CardTitle>
          <CardDescription>
            Example: &quot;We only deliver in Karachi&quot; or &quot;Refunds within 3 days if unopened&quot;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Title (e.g. Delivery area)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Rule in plain English..."
            value={rule}
            onChange={(e) => setRule(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Button onClick={handleCreate} disabled={creating || !title.trim() || !rule.trim()}>
            {creating ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
            Add protocol
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="size-4" />
            Active protocols
          </CardTitle>
          <CardDescription>
            {protocols.filter((p) => p.isActive).length} active · {protocols.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : protocols.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No protocols yet.</p>
          ) : (
            <div className="space-y-3">
              {protocols.map((protocol) => (
                <div
                  key={protocol._id}
                  className={`rounded-lg border p-4 space-y-2 ${!protocol.isActive ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{protocol.title}</p>
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {protocol.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => toggleActive(protocol)}
                      >
                        {protocol.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => handleDelete(protocol._id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{protocol.rule}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
