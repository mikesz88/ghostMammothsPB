// Membership and payment types for Ghost Mammoths PB

export type MembershipStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "past_due"
  | "trialing"
  | "free";
export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "cancelled";
export type PaymentType = "membership" | "event" | "product" | "refund";
export type PaymentMethod = "card" | "cash" | "other";
export type RegistrationStatus =
  | "registered"
  | "attended"
  | "no_show"
  | "cancelled";
export type EventPaymentStatus =
  | "not_required"
  | "pending"
  | "paid"
  | "refunded";

export interface MembershipTier {
  id: string;
  name: string; // 'free', 'monthly'
  displayName: string;
  description?: string;
  price: number;
  billingPeriod: "monthly" | "annual" | "one-time" | "free";
  stripePriceId?: string;
  features: {
    eventAccess?: "pay_per_event" | "unlimited";
    priorityQueue?: boolean;
    exclusiveEvents?: boolean;
    merchandiseDiscount?: number;
    [key: string]: unknown;
  };
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMembership {
  id: string;
  userId: string;
  tierId: string;
  status: MembershipStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  tier?: MembershipTier;
}

export interface Payment {
  id: string;
  userId?: string;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  paymentMethod?: PaymentMethod;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  status: PaymentStatus;
  description?: string;
  metadata?: Record<string, unknown>;
  refundedAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  paymentId?: string;
  status: RegistrationStatus;
  paymentRequired: boolean;
  paymentStatus: EventPaymentStatus;
  checkedInAt?: Date;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    skillLevel: string;
  };
  payment?: Payment;
}

// Extended Event type with pricing
export interface EventWithPricing {
  id: string;
  name: string;
  location: string;
  date: Date;
  courtCount: number;
  rotationType: string;
  status: string;
  price: number;
  freeForMembers: boolean;
  maxParticipants?: number;
  requiresMembership: boolean;
  createdAt: Date;
  updatedAt: Date;
  registrationCount?: number;
}

// Stripe types
export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  priceId: string;
}

// API response types
export interface MembershipCheckResponse {
  canJoin: boolean;
  reason?: string;
  requiresPayment: boolean;
  amount?: number;
  membershipStatus: MembershipStatus;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  error?: string;
}

// Admin dashboard types
export interface MembershipStats {
  totalUsers: number;
  freeMembers: number;
  paidMembers: number;
  monthlyRevenue: number;
  churnRate: number;
  newMembersThisMonth: number;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  totalAttendees: number;
  averageAttendeesPerEvent: number;
  revenueFromEvents: number;
}

export interface UserStats {
  totalEventsAttended: number;
  totalGamesPlayed: number;
  favoriteLocation?: string;
  memberSince: Date;
  totalSpent: number;
}
