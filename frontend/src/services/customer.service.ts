import api from "./api";

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  tags: string[];
  notes?: string;
  source: "whatsapp" | "gmail" | "slack" | "manual" | "import";
  lastContactedAt?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export const customerService = {
  list: async (page = 1, search?: string, tag?: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    const { data } = await api.get(`/customers?${params}`);
    return data as { customers: Customer[]; total: number; page: number; totalPages: number };
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/customers/${id}`);
    return data.customer as Customer;
  },

  create: async (body: { name: string; phone: string; email?: string; tags?: string[]; notes?: string }) => {
    const { data } = await api.post("/customers", body);
    return data.customer as Customer;
  },

  update: async (id: string, body: Partial<{ name: string; phone: string; email: string; tags: string[]; notes: string }>) => {
    const { data } = await api.put(`/customers/${id}`, body);
    return data.customer as Customer;
  },

  delete: async (id: string) => {
    await api.delete(`/customers/${id}`);
  },
};
