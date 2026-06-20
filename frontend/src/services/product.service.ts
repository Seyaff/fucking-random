import api from "./api";
import type { Product, DetectResult, ImportResult } from "@/types/product";

export const productService = {
  list: async (page = 1): Promise<{ products: Product[]; total: number; totalPages: number }> => {
    const { data } = await api.get(`/products?page=${page}`);
    return data;
  },

  search: async (q: string): Promise<Product[]> => {
    const { data } = await api.get(`/products/search?q=${encodeURIComponent(q)}`);
    return data.products;
  },

  detectColumns: async (file: File): Promise<DetectResult> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/products/import/detect", form);
    return data;
  },

  importCsv: async (file: File): Promise<ImportResult> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/products/import/csv", form);
    return data;
  },
};
