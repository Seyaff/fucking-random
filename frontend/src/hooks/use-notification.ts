import { useCallback, useEffect, useState } from "react";

type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermissionState>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission as NotificationPermissionState;
  });

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermissionState);
  }, []);

  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted") return;
      if (document.visibilityState === "visible") return;
      new Notification(title, options);
    },
    [permission]
  );

  return { permission, requestPermission, notify };
}
