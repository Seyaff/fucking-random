import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quickReplyService } from "@/services/quick-reply.service";

export function useQuickReplies(category?: string, search?: string) {
  return useQuery({
    queryKey: ["quick-replies", category, search],
    queryFn: () => quickReplyService.list(category, search),
  });
}

export function useCreateQuickReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quickReplyService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quick-replies"] }),
  });
}

export function useUpdateQuickReply(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof quickReplyService.update>[1]) => quickReplyService.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quick-replies"] }),
  });
}

export function useDeleteQuickReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quickReplyService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quick-replies"] }),
  });
}
