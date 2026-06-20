import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";
import { useNotification } from "./use-notification";

type SseEventType = "new_message" | "new_conversation" | "order_created" | "whatsapp_status_changed";

export function useEventStream() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { notify } = useNotification();
  const esRef = useRef<EventSource | null>(null);

  const handleEvent = useCallback(
    (type: SseEventType, data?: Record<string, unknown>) => {
      switch (type) {
        case "new_message":
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["messages"] });
          notify("New message", {
            body: `New message from ${(data?.customerPhone as string) || "a customer"}`,
            tag: "new-message",
          });
          break;
        case "new_conversation":
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          notify("New conversation", { body: "A customer started a new conversation", tag: "new-conversation" });
          break;
        case "order_created":
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          break;
        case "whatsapp_status_changed":
          queryClient.invalidateQueries({ queryKey: ["whatsapp-connection"] });
          break;
      }
    },
    [queryClient, notify]
  );

  useEffect(() => {
    if (!accessToken) return;

    const es = new EventSource(`${env.API_URL}/api/v1/events?token=${accessToken}`);
    esRef.current = es;

    const onEvent = (type: SseEventType) => (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        handleEvent(type, data);
      } catch {
        handleEvent(type);
      }
    };

    es.addEventListener("new_message", onEvent("new_message"));
    es.addEventListener("new_conversation", onEvent("new_conversation"));
    es.addEventListener("order_created", onEvent("order_created"));
    es.addEventListener("whatsapp_status_changed", onEvent("whatsapp_status_changed"));

    es.onerror = () => {};

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [accessToken, handleEvent]);
}
