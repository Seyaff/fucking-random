export interface ConnectorStatus {
  provider: "gmail" | "slack";
  isConnected: boolean;
  email?: string | null;
  teamName?: string | null;
}

export interface ConnectorStatuses {
  gmail: ConnectorStatus;
  slack: ConnectorStatus;
}

export interface GmailEmail {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  labelIds: string[];
}

export interface GmailEmailDetail extends GmailEmail {
  to: string;
  cc: string;
  body: string;
}

export interface SlackMessage {
  channelId: string;
  channelName: string;
  user: string;
  text: string;
  timestamp: string;
  threadTs: string | null;
}
