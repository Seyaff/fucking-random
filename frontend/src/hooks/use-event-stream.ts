import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
        case "new_message": {
          const phone = (data?.customerPhone as string) || "a customer";
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["messages"] });
          toast.info(`New message from ${phone}`, {
            description: (data?.preview as string) || undefined,
            duration: 4000,
          });
          notify("New message", {
            body: `New message from ${phone}`,
            tag: "new-message",
          });
          break;
        }
        case "new_conversation":
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          toast.success("New conversation started", {
            description: "A customer has started a new conversation",
            duration: 4000,
          });
          notify("New conversation", { body: "A customer started a new conversation", tag: "new-conversation" });
          break;
        case "order_created": {
          const orderId = (data?.orderId as string) || "";
          const customerName = (data?.customerName as string) || "Someone";
          const total = (data?.totalAmount as number) || 0;
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          toast.success(`Order placed!`, {
            description: `${customerName} — ${orderId} — $${total.toFixed(2)}`,
            duration: 5000,
          });
          break;
        }
        case "whatsapp_status_changed":
          queryClient.invalidateQueries({ queryKey: ["whatsapp-connection"] });
          toast("WhatsApp connection status changed", {
            description: "Check your settings for details",
          });
          break;
      }
    },
    [queryClient, notify]
  );

  useEffect(() => {
    if (!accessToken) return;

    const es = new EventSource(`${env.API_URL}/events?token=${accessToken}`);
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
