import api from "./api";
import type { AgentStats } from "@/types/agent";

export const agentService = {
  test: async (
    message: string
  ): Promise<{ reply: string; trace?: { intent: string; handler: string; toolsCalled: string[] } }> => {
    const { data } = await api.post("/agent/test", { message });
    return { reply: data.reply, trace: data.trace };
  },

  getStats: async (days = 7): Promise<{ stats: AgentStats; periodDays: number }> => {
    const { data } = await api.get("/agent/stats", { params: { days } });
    return { stats: data.stats, periodDays: data.periodDays };
  },
};
