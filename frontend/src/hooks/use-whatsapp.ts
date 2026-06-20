import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappService } from "@/services/whatsapp.service";

export function useWhatsAppConnection() {
  return useQuery({
    queryKey: ["whatsapp-connection"],
    queryFn: whatsappService.getConnection,
  });
}

export function useConnectWhatsApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof whatsappService.connect>[0]) =>
      whatsappService.connect(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-connection"] });
    },
  });
}

export function useDisconnectWhatsApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: whatsappService.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-connection"] });
    },
  });
}
