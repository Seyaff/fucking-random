import api from "./api";

export interface WhatsAppConnection {
  _id: string;
  phoneNumber: string;
  phoneNumberId: string;
  isConnected: boolean;
  createdAt: string;
}

export const whatsappService = {
  getConnection: async (): Promise<WhatsAppConnection | null> => {
    const { data } = await api.get("/whatsapp/my-connection");
    return data.connection;
  },

  connect: async (payload: {
    phoneNumberId: string;
    phoneNumber: string;
    accessToken: string;
    verifyToken: string;
  }): Promise<{ message: string; account: WhatsAppConnection }> => {
    const { data } = await api.post("/whatsapp/connect", payload);
    return data;
  },

  disconnect: async (): Promise<void> => {
    await api.post("/whatsapp/disconnect");
  },
};
