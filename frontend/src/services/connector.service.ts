import api from "./api";
import type { ConnectorStatuses, GmailEmail, GmailEmailDetail, SlackMessage } from "@/types/connector";

export const connectorService = {
  listStatus: async (): Promise<ConnectorStatuses> => {
    const { data } = await api.get("/connectors");
    return data;
  },

  getGmailStatus: async (): Promise<{ isConnected: boolean; email?: string }> => {
    const { data } = await api.get("/connectors/gmail/status");
    return data;
  },

  getSlackStatus: async (): Promise<{ isConnected: boolean; teamName?: string }> => {
    const { data } = await api.get("/connectors/slack/status");
    return data;
  },

  getGmailAuthUrl: async (): Promise<string> => {
    const { data } = await api.get("/connectors/gmail/auth");
    return data.url;
  },

  getSlackAuthUrl: async (): Promise<string> => {
    const { data } = await api.get("/connectors/slack/auth");
    return data.url;
  },

  disconnectGmail: async (): Promise<void> => {
    await api.post("/connectors/gmail/disconnect");
  },

  disconnectSlack: async (): Promise<void> => {
    await api.post("/connectors/slack/disconnect");
  },

  fetchGmailData: async (): Promise<GmailEmail[]> => {
    const { data } = await api.get("/connectors/gmail/data");
    return data.emails;
  },

  fetchSlackData: async (): Promise<SlackMessage[]> => {
    const { data } = await api.get("/connectors/slack/data");
    return data.messages;
  },

  fetchGmailEmailDetail: async (emailId: string): Promise<GmailEmailDetail> => {
    const { data } = await api.get(`/connectors/gmail/data/${emailId}`);
    return data.email;
  },
};
