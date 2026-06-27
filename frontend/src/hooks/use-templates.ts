import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templateService } from "@/services/template.service";
import type { TemplateStatus } from "@/services/template.service";

export function useTemplates(page = 1, status?: TemplateStatus) {
  return useQuery({
    queryKey: ["templates", page, status],
    queryFn: () => templateService.list(page, status),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: templateService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}

export function useUpdateTemplate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof templateService.update>[1]) => templateService.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: templateService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}
