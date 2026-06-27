import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";

export function useCustomers(page = 1, search?: string, tag?: string) {
  return useQuery({
    queryKey: ["customers", page, search, tag],
    queryFn: () => customerService.list(page, search, tag),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customerService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof customerService.update>[1]) => customerService.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}
