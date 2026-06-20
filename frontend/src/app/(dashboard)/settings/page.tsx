"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Check, AlertCircle, Copy, ExternalLink } from "lucide-react";
import { env } from "@/config/env";
import { whatsappService, type WhatsAppConnection } from "@/services/whatsapp.service";

const WEBHOOK_URL = `${env.API_URL}/whatsapp/webhook`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs h-7 shrink-0"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="size-3 mr-1" /> : <Copy className="size-3 mr-1" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export default function SettingsPage() {
  const [connection, setConnection] = useState<WhatsAppConnection | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    businessAccountId: "",
    phoneNumberId: "",
    phoneNumber: "",
    accessToken: "",
    verifyToken: "",
  });

  useEffect(() => {
    whatsappService.getConnection().then((conn) => {
      setConnection(conn);
    }).catch(() => {
      setConnection(null);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConnecting(true);
    try {
      const result = await whatsappService.connect(form);
      setConnection(result.account);
      setForm({ businessAccountId: "", phoneNumberId: "", phoneNumber: "", accessToken: "", verifyToken: "" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to connect";
      setError(msg);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setDisconnecting(true);
    try {
      await whatsappService.disconnect();
      setConnection(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to disconnect";
      setError(msg);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and integrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="size-5" />
            WhatsApp Integration
          </CardTitle>
          <CardDescription>
            Connect your WhatsApp Business account to start receiving and replying to messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : connection?.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{connection.phoneNumber}</p>
                    <Badge variant="default" className="text-[10px] mt-0.5 bg-green-600">Connected</Badge>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="text-xs h-8"
                >
                  {disconnecting ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
                  Disconnect
                </Button>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Webhook Callback URL</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted rounded px-2 py-1.5 truncate font-mono">
                    {WEBHOOK_URL}
                  </code>
                  <CopyButton text={WEBHOOK_URL} />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Set this as the callback URL in your Meta Developer Console under WhatsApp &rarr; Configuration
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Verify Token</p>
                <p className="text-xs text-muted-foreground">
                  Use the verify token you entered when connecting. Meta will send a verification request to the webhook URL above.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium">How to get your credentials</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                  <li>
                    Go to the{" "}
                    <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
                      Meta Developer Console <ExternalLink className="size-3" />
                    </a>
                  </li>
                  <li>Create a new app or use an existing one with <strong>WhatsApp</strong> product added</li>
                  <li>Go to <strong>WhatsApp &rarr; Getting started</strong></li>
                  <li>Copy the <strong>Business Account ID</strong> (WABA ID)</li>
                  <li>Copy the <strong>Phone number ID</strong> and the <strong>phone number</strong> it belongs to</li>
                  <li>Generate a <strong>Permanent Access Token</strong> from the same page (or use a temporary one for testing)</li>
                  <li>Go to <strong>WhatsApp &rarr; Configuration</strong></li>
                  <li>Set the callback URL to: <code className="bg-muted px-1 rounded text-[10px]">{WEBHOOK_URL}</code></li>
                  <li>Set a <strong>Verify Token</strong> of your choice — enter the same value below</li>
                </ol>
                <div className="flex items-center gap-2 mt-2">
                  <CopyButton text={WEBHOOK_URL} />
                  <span className="text-[10px] text-muted-foreground">Copy webhook URL</span>
                </div>
              </div>

              <form onSubmit={handleConnect} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="businessAccountId" className="text-xs">WhatsApp Business Account ID (WABA ID)</Label>
                  <Input
                    id="businessAccountId"
                    value={form.businessAccountId}
                    onChange={(e) => setForm({ ...form, businessAccountId: e.target.value })}
                    placeholder="e.g. 123456789012345"
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumberId" className="text-xs">Phone Number ID</Label>
                    <Input
                      id="phoneNumberId"
                      value={form.phoneNumberId}
                      onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })}
                      placeholder="e.g. 123456789012345"
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-xs">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      placeholder="e.g. 12025550142"
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="accessToken" className="text-xs">Access Token</Label>
                  <Input
                    id="accessToken"
                    value={form.accessToken}
                    onChange={(e) => setForm({ ...form, accessToken: e.target.value })}
                    placeholder="EAAT... (Permanent or temporary token)"
                    required
                    className="h-9 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="verifyToken" className="text-xs">Verify Token</Label>
                  <Input
                    id="verifyToken"
                    value={form.verifyToken}
                    onChange={(e) => setForm({ ...form, verifyToken: e.target.value })}
                    placeholder="Your custom verify token"
                    required
                    className="h-9 text-sm"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={connecting} className="w-full">
                  {connecting ? <Loader2 className="size-4 animate-spin mr-2" /> : <Phone className="size-4 mr-2" />}
                  {connecting ? "Connecting..." : "Connect WhatsApp"}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
