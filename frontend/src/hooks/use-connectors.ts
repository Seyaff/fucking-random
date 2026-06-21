import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { connectorService } from "@/services/connector.service";

export function useConnectorStatuses() {
  return useQuery({
    queryKey: ["connectors"],
    queryFn: connectorService.listStatus,
  });
}

export function useGmailData() {
  return useQuery({
    queryKey: ["connectors", "gmail", "data"],
    queryFn: connectorService.fetchGmailData,
    enabled: false,
  });
}

export function useSlackData() {
  return useQuery({
    queryKey: ["connectors", "slack", "data"],
    queryFn: connectorService.fetchSlackData,
    enabled: false,
  });
}

export function useDisconnectGmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectorService.disconnectGmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors"] });
    },
  });
}

export function useDisconnectSlack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectorService.disconnectSlack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors"] });
    },
  });
}
