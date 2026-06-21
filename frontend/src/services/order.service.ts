import api from "./api";
import type { Order, OrderListResponse } from "@/types/order";

export const orderService = {
  list: async (page = 1): Promise<OrderListResponse> => {
    const { data } = await api.get(`/orders?page=${page}`);
    return data;
  },

  getByOrderId: async (orderId: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${orderId}`);
    return data.order;
  },
};
