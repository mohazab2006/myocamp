export type AudienceTag =
  | "youth"
  | "parents"
  | "families"
  | "leaders"
  | "brothers"
  | "sisters"
  | "all";
export type EventType =
  | "hike"
  | "campfire"
  | "fundraiser"
  | "social"
  | "service"
  | "camp"
  | "workshop";
export type ProgramType = "weekly" | "cohort" | "drop-in" | "mentorship";

export interface OrgEvent {
  slug: string;
  title: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  location: string;
  audience: AudienceTag[];
  blurb: string;
  body?: string;
  heroImage?: string;
  registerUrl?: string;
  registerOpens?: string;
  registerCloses?: string;
  cost?: string;
  archived?: boolean;
  /** Links this event page to a camp in /admin/camps (registration, image, etc.). */
  campSlug?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  body?: string;
  heroImage?: string;
}

export interface OrgProgram {
  slug: string;
  title: string;
  type: ProgramType;
  cadence: string;
  audience: AudienceTag[];
  blurb: string;
  body?: string;
  heroImage?: string;
  signupUrl?: string;
  active: boolean;
  startedAt?: string;
}

export type SocialPlatform = "facebook" | "instagram" | "email" | "photos" | "vimeo" | "camp";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
}

export interface SiteSettings {
  email: string;
  donateUrl: string;
  volunteerUrl: string;
  newsletterUrl: string;
  socials: SocialLink[];
}

// =============================================================================
// Camps + registrations + payments (0002 schema)
// =============================================================================

export type CampStatus = "draft" | "open" | "full" | "closed" | "archived";

export interface Camp {
  id: string;
  slug: string;
  title: string;
  status: CampStatus;
  capacity: number | null;
  startDate: string;
  endDate: string;
  location: string | null;
  feePerCamper: number;
  registrationFormJotformId: string | null;
  waitlistFormJotformId: string | null;
  registrationClosesAt: string | null;
  autoCloseAtCapacity: boolean;
  paymentEmail: string | null;
  heroImage: string | null;
  featuredOnEvents: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampStats {
  registeredCount: number;
  paidCount: number;
  unpaidCount: number;
  collected: number;
  outstanding: number;
  waitlistCount: number;
}

export type RegistrationStatus = "active" | "cancelled" | "refunded";
export type RegistrationSource = "jotform" | "waitlist_claim" | "manual";

export interface CamperInfo {
  name?: string;
  age?: number | string;
  allergies?: string;
  medical?: string;
  [key: string]: unknown;
}

export interface Registration {
  id: string;
  campId: string;
  jotformSubmissionId: string | null;
  source: RegistrationSource;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  campers: CamperInfo[];
  rawPayload: Record<string, unknown>;
  status: RegistrationStatus;
  promotedFromWaitlistId: string | null;
  cancelledAt: string | null;
  cancelledReason: string | null;
  notes: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = "pending" | "paid" | "partial" | "refunded" | "cancelled";

export interface Invoice {
  id: string;
  registrationId: string;
  referenceCode: string;
  amountDue: number;
  amountPaid: number;
  status: InvoiceStatus;
  dueDate: string | null;
  sentAt: string | null;
  paidAt: string | null;
  lastRemindedAt: string | null;
  reminderCount: number;
  autoRemindersPaused: boolean;
  pausedUntil: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = "paypal" | "etransfer" | "cash" | "stripe" | "manual";
export type PaymentStatus = "received" | "refunded" | "failed" | "pending";

export interface Payment {
  id: string;
  invoiceId: string | null;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  externalRef: string | null;
  senderName: string | null;
  senderEmail: string | null;
  senderMemo: string | null;
  cashReceived: boolean | null;
  receivedAt: string;
  matchedBy: string | null;
  notes: string | null;
  rawPayload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type WaitlistEntryStatus = "active" | "promoted" | "claimed" | "expired" | "removed";

export interface WaitlistEntry {
  id: string;
  campId: string;
  jotformSubmissionId: string | null;
  position: number | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  camperName: string | null;
  rawPayload: Record<string, unknown>;
  status: WaitlistEntryStatus;
  promotedAt: string | null;
  claimToken: string | null;
  claimExpiresAt: string | null;
  claimedRegistrationId: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Inbound emails + Gmail credentials (0003)
// =============================================================================

export type InboundEmailMatchStatus =
  | "pending"
  | "matched"
  | "unmatched"
  | "duplicate"
  | "not_payment"
  | "error";

export interface InboundEmail {
  id: string;
  gmailMessageId: string;
  fromAddress: string | null;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  parsedAmount: number | null;
  parsedSenderName: string | null;
  parsedMemo: string | null;
  parsedReferenceCode: string | null;
  matchStatus: InboundEmailMatchStatus;
  matchedPaymentId: string | null;
  errorMessage: string | null;
  receivedAt: string;
  processedAt: string | null;
  rawPayload: Record<string, unknown>;
}

export interface GmailCredentials {
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  scope: string;
  lastPolledAt: string | null;
  lastPolledStatus: "ok" | "error" | null;
  lastPolledError: string | null;
  lastMessagesSeen: number;
  lastMessagesMatched: number;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Email templates + reminder log (0004)
// =============================================================================

export type ReminderKind =
  | "registration_received"
  | "payment_followup_d2"
  | "invoice_reminder_t7"
  | "invoice_reminder_t3"
  | "invoice_reminder_t1"
  | "invoice_reminder_manual"
  | "waitlist_promoted"
  | "payment_confirmation";

export type ReminderTrigger = "auto" | "manual";
export type ReminderStatus =
  | "sent"
  | "delivered"
  | "bounced"
  | "opened"
  | "clicked"
  | "failed";

export interface ReminderLogRow {
  id: string;
  invoiceId: string | null;
  registrationId: string | null;
  waitlistEntryId: string | null;
  reminderNumber: ReminderKind | string;
  templateId: string | null;
  trigger: ReminderTrigger;
  sentBy: string | null;
  sentTo: string | null;
  subject: string | null;
  emailProviderId: string | null;
  errorMessage: string | null;
  status: ReminderStatus;
  sentAt: string;
}

export interface CampSettings {
  registrationStatus: "open" | "full" | "closed" | "opening-soon";
  registrationOpens?: string;
  registrationDeadline?: string;
  litStart?: string;
  litEnd?: string;
  campStart: string;
  campEnd: string;
  staffArrival: string;
  formUrl: string;
  feeCamper: number;
  feeLit: number;
  dropOff: string;
  pickUp: string;
  paymentEmail: string;
  paypalDonateId: string;
}
