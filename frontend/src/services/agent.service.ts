import api from "./api";

export const agentService = {
  test: async (message: string): Promise<string> => {
    const { data } = await api.post("/agent/test", { message });
    return data.reply;
  },
};
