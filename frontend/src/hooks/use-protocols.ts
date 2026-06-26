import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { protocolService } from "@/services/protocol.service";
import type { ProtocolCategory } from "@/types/protocol";

export function useProtocols() {
  return useQuery({
    queryKey: ["protocols"],
    queryFn: protocolService.list,
  });
}

export function useCreateProtocol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      rule: string;
      category?: ProtocolCategory;
      priority?: number;
    }) => protocolService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["protocols"] }),
  });
}

export function useUpdateProtocol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      title?: string;
      rule?: string;
      category?: ProtocolCategory;
      isActive?: boolean;
      priority?: number;
    }) => protocolService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["protocols"] }),
  });
}

export function useDeleteProtocol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => protocolService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["protocols"] }),
  });
}
