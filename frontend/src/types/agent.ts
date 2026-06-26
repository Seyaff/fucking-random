export interface AgentTrace {
  _id: string;
  userId: string;
  conversationId?: string;
  customerPhone?: string;
  inboundMessage: string;
  outboundMessage: string;
  intent: string;
  handler: string;
  protocolsUsed: string[];
  toolsCalled: { name: string; args: Record<string, unknown>; result: string }[];
  latencyMs: number;
  success: boolean;
  error?: string;
  createdAt: string;
}

export interface AgentStats {
  messagesHandled: number;
  escalations: number;
  avgLatencyMs: number;
}

export interface AgentMessageTrace {
  intent: string;
  handler: string;
  toolsCalled: string[];
}
