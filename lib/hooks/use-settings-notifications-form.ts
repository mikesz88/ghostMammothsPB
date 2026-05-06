"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useNotifications } from "@/lib/use-notifications";

import type {
  SettingsNotificationsBooleanKey,
  SettingsNotificationsFormState,
} from "@/lib/settings/settings-notifications-form-types";
import type { Dispatch, SetStateAction } from "react";

function buildInitialSettings(
  emailFallback: string,
): SettingsNotificationsFormState {
  return {
    browserNotifications: false,
    emailNotifications: true,
    smsNotifications: false,
    notifyOnQueueJoin: true,
    notifyOnPositionChange: true,
    notifyOnUpNext: true,
    notifyOnCourtAssignment: true,
    notifyOnGameStart: true,
    email: emailFallback,
    phone: "",
  };
}

function scheduleBrowserPermissionRequest(
  requestPermission: () => Promise<NotificationPermission>,
  setSettings: Dispatch<SetStateAction<SettingsNotificationsFormState>>,
) {
  void requestPermission().then((result) => {
    setSettings((p) => ({
      ...p,
      browserNotifications: result === "granted",
    }));
  });
}

export function useSettingsNotificationsForm(initialEmail: string | null) {
  const { requestPermission } = useNotifications();
  const [settings, setSettings] = useState(() =>
    buildInitialSettings(initialEmail ?? ""),
  );

  const handleToggle = useCallback(
    (key: SettingsNotificationsBooleanKey) => {
      setSettings((prev) => {
        if (key === "browserNotifications" && !prev.browserNotifications) {
          scheduleBrowserPermissionRequest(requestPermission, setSettings);
          return prev;
        }
        return { ...prev, [key]: !prev[key] };
      });
    },
    [requestPermission],
  );

  const handleSave = useCallback(() => {
    toast.success("Notification settings saved!");
  }, []);

  return { settings, handleToggle, handleSave };
}
