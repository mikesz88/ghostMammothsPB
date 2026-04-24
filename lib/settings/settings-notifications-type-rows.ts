import type { SettingsNotificationsBooleanKey } from "@/lib/settings/settings-notifications-form-types";

export type SettingsNotificationTypeRowDef = {
  id: string;
  label: string;
  description: string;
  key: SettingsNotificationsBooleanKey;
};

export const SETTINGS_NOTIFICATION_TYPE_ROWS: readonly SettingsNotificationTypeRowDef[] =
  [
    {
      id: "queue-join",
      label: "Queue Joined",
      description: "When you successfully join a queue",
      key: "notifyOnQueueJoin",
    },
    {
      id: "position-change",
      label: "Position Changes",
      description: "When you move up in the queue",
      key: "notifyOnPositionChange",
    },
    {
      id: "up-next",
      label: "Up Next Alert",
      description: "When you're in the top 4 of the queue",
      key: "notifyOnUpNext",
    },
    {
      id: "court-assignment",
      label: "Court Assignment",
      description: "When you're assigned to a court",
      key: "notifyOnCourtAssignment",
    },
    {
      id: "game-start",
      label: "Game Starting Soon",
      description: "5 minutes before your game starts",
      key: "notifyOnGameStart",
    },
  ];
