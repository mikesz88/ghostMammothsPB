export type SettingsNotificationsFormState = {
  browserNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  notifyOnQueueJoin: boolean;
  notifyOnPositionChange: boolean;
  notifyOnUpNext: boolean;
  notifyOnCourtAssignment: boolean;
  notifyOnGameStart: boolean;
  email: string;
  phone: string;
};

export type SettingsNotificationsBooleanKey = Exclude<
  keyof SettingsNotificationsFormState,
  "email" | "phone"
>;
