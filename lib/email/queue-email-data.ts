export interface QueueEmailData {
  userName: string;
  userEmail: string;
  eventName: string;
  eventLocation: string;
  eventDate: string;
  /** When the email was sent (Central time), e.g. "February 5th, 2026 at 3:32 PM" */
  sentAt?: string;
  currentPosition: number;
  estimatedWaitTime?: number;
  courtNumber?: number;
}
