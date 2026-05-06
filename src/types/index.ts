// Types that mirror Prisma enums for use in API + frontend
// These are duplicated from the schema so the frontend doesn't need Prisma

export type Channel = "EMAIL" | "FORM" | "SOCIAL" | "API";
export type InquiryStatus = "NEW" | "PROCESSING" | "AWAITING_REPLY" | "REPLIED" | "FOLLOW_UP" | "CLOSED";
export type Category = "PARTNERSHIP" | "SALES" | "INVESTMENT" | "SUPPORT" | "TALENT" | "ONBOARDING" | "SPAM" | "GENERAL";
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "URGENT";
export type FollowUpStatus = "PENDING" | "SENT" | "FAILED" | "CANCELLED";
export type TeamRole = "FOUNDER" | "SALES" | "SUPPORT" | "ENGINEERING" | "MARKETING";

export interface ContactDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  channel: Channel;
}

export interface InquiryDTO {
  id: string;
  subject: string;
  body: string;
  channel: Channel;
  status: InquiryStatus;
  category: Category | null;
  priority: Priority | null;
  intent: string | null;
  sentiment: Sentiment | null;
  aiDraft: string | null;
  receivedAt: string;
  processedAt: string | null;
  contact: ContactDTO;
  assignedTo: TeamMemberDTO | null;
  followUps: FollowUpDTO[];
}

export interface FollowUpDTO {
  id: string;
  message: string;
  scheduledAt: string;
  sentAt: string | null;
  status: FollowUpStatus;
  attempt: number;
}

export interface TeamMemberDTO {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
}

// AI classification result from OpenAI
export interface AIClassification {
  category: Lowercase<Category>;
  priority: Lowercase<Priority>;
  intent: string;
  sentiment: Lowercase<Sentiment>;
  suggestedAssignment: string;
  draftReply: string;
  followUpDays: number;
}

// Inbound inquiry payload (what external sources POST)
export interface InboundInquiry {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  channel: Channel;
  company?: string;
  phone?: string;
}
