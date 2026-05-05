export enum NotificationSeverity {
  Info = 0,
  Warning = 1,
  Critical = 2,
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  readAtUtc: string | null;
  createdOnUtc: string;
}

export interface UnreadCountResponse {
  count: number;
}

/** Payload pushed by SignalR — server uses int for severity. */
export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: number;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAtUtc: string;
}
