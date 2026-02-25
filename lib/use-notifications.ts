"use client";

import { useEffect, useState } from "react";

export type NotificationType =
  | "queue-join"
  | "queue-leave"
  | "position-change"
  | "up-next"
  | "court-assignment"
  | "game-start";

export interface NotificationSettings {
  browserNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  notifyOnQueueJoin: boolean;
  notifyOnPositionChange: boolean;
  notifyOnUpNext: boolean;
  notifyOnCourtAssignment: boolean;
  notifyOnGameStart: boolean;
}

export function useNotifications() {
  const isBrowser = typeof window !== "undefined";
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<NotificationSettings>({
    browserNotifications: false,
    emailNotifications: true,
    smsNotifications: false,
    notifyOnQueueJoin: true,
    notifyOnPositionChange: true,
    notifyOnUpNext: true,
    notifyOnCourtAssignment: true,
    notifyOnGameStart: true,
  });

  useEffect(() => {
    if (!isBrowser) return;
    if ("Notification" in window) {
      queueMicrotask(() => setPermission(Notification.permission));
    }
    const savedSettings = window.localStorage.getItem("notification-settings");
    if (savedSettings) {
      queueMicrotask(() => setSettings(JSON.parse(savedSettings)));
    }
  }, [isBrowser]);

  const requestPermission = async () => {
    if (isBrowser && "Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return "denied";
  };

  const sendNotification = (
    type: NotificationType,
    title: string,
    options?: NotificationOptions
  ) => {
    // Check if this notification type is enabled
    const typeEnabled = {
      "queue-join": settings.notifyOnQueueJoin,
      "queue-leave": settings.notifyOnQueueJoin, // Use same setting as queue-join
      "position-change": settings.notifyOnPositionChange,
      "up-next": settings.notifyOnUpNext,
      "court-assignment": settings.notifyOnCourtAssignment,
      "game-start": settings.notifyOnGameStart,
    }[type];

    if (!typeEnabled) return;

    if (
      permission === "granted" &&
      isBrowser &&
      "Notification" in window &&
      settings.browserNotifications
    ) {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    }

    console.log("[v0] Notification triggered:", { type, title, settings });
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (isBrowser) {
      window.localStorage.setItem(
        "notification-settings",
        JSON.stringify(updated)
      );
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: isBrowser && typeof Notification !== "undefined",
    settings,
    updateSettings,
  };
}
