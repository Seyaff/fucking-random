import api from "./api";

export interface QuickReply {
  _id: string;
  title: string;
  content: string;
  shortcuts: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const quickReplyService = {
  list: async (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const qs = params.toString();
    const { data } = await api.get(`/quick-replies${qs ? `?${qs}` : ""}`);
    return data as { replies: QuickReply[]; total: number };
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/quick-replies/${id}`);
    return data.reply as QuickReply;
  },

  create: async (body: { title: string; content: string; shortcuts?: string[]; category?: string }) => {
    const { data } = await api.post("/quick-replies", body);
    return data.reply as QuickReply;
  },

  update: async (id: string, body: Partial<{ title: string; content: string; shortcuts: string[]; category: string }>) => {
    const { data } = await api.put(`/quick-replies/${id}`, body);
    return data.reply as QuickReply;
  },

  delete: async (id: string) => {
    await api.delete(`/quick-replies/${id}`);
  },
};
