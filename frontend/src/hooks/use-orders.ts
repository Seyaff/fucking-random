import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";

export function useOrders(page = 1) {
  return useQuery({
    queryKey: ["orders", page],
    queryFn: () => orderService.list(page),
  });
}

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getByOrderId(orderId!),
    enabled: !!orderId,
  });
}
