import api from "./api";
import type { Protocol, ProtocolCategory } from "@/types/protocol";

export const protocolService = {
  list: async (): Promise<Protocol[]> => {
    const { data } = await api.get("/protocols");
    return data.protocols;
  },

  create: async (payload: {
    title: string;
    rule: string;
    category?: ProtocolCategory;
    priority?: number;
  }): Promise<Protocol> => {
    const { data } = await api.post("/protocols", payload);
    return data.protocol;
  },

  update: async (
    id: string,
    payload: Partial<{
      title: string;
      rule: string;
      category: ProtocolCategory;
      isActive: boolean;
      priority: number;
    }>
  ): Promise<Protocol> => {
    const { data } = await api.patch(`/protocols/${id}`, payload);
    return data.protocol;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/protocols/${id}`);
  },
};
