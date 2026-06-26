import { useQuery } from "@tanstack/react-query";
import { agentService } from "@/services/agent.service";

export function useAgentStats(days = 7) {
  return useQuery({
    queryKey: ["agent-stats", days],
    queryFn: () => agentService.getStats(days),
    refetchInterval: 60_000,
  });
}
