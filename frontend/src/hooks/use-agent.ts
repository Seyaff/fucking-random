import { useMutation } from "@tanstack/react-query";
import { agentService } from "@/services/agent.service";

export function useAgentTest() {
  return useMutation({
    mutationFn: (message: string) => agentService.test(message),
  });
}
