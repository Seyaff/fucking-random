import api from "./api";

export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";
export type TemplateStatus = "draft" | "pending" | "approved" | "rejected";

export interface TemplateButton {
  type: "quick_reply" | "url" | "phone_number";
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface TemplateHeader {
  type: "text" | "image" | "video" | "document";
  text?: string;
  mediaUrl?: string;
}

export interface Template {
  _id: string;
  name: string;
  category: TemplateCategory;
  language: string;
  body: string;
  header?: TemplateHeader;
  footer?: string;
  buttons: TemplateButton[];
  exampleValues: string[];
  status: TemplateStatus;
  rejectionReason?: string;
  whatsappId?: string;
  createdAt: string;
  updatedAt: string;
}

export const templateService = {
  list: async (page = 1, status?: TemplateStatus) => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    const { data } = await api.get(`/templates?${params}`);
    return data as { templates: Template[]; total: number; page: number; totalPages: number };
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/templates/${id}`);
    return data.template as Template;
  },

  create: async (body: { name: string; category: TemplateCategory; body: string; language?: string; header?: TemplateHeader; footer?: string; buttons?: TemplateButton[]; exampleValues?: string[] }) => {
    const { data } = await api.post("/templates", body);
    return data.template as Template;
  },

  update: async (id: string, body: Partial<{ name: string; category: TemplateCategory; body: string; language: string; header: TemplateHeader; footer: string; buttons: TemplateButton[]; exampleValues: string[]; status: TemplateStatus; rejectionReason: string }>) => {
    const { data } = await api.put(`/templates/${id}`, body);
    return data.template as Template;
  },

  delete: async (id: string) => {
    await api.delete(`/templates/${id}`);
  },
};
