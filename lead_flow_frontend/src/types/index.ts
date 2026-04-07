// src/types/index.ts
import { LEAD_STATUSES } from "@/constants";

export type LeadStatus = typeof LEAD_STATUSES[keyof typeof LEAD_STATUSES];

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface LeadActivity {
  id: number;
  description: string;
  created_at: string;
}

export interface WebhookLog {
  id: number;
  event_type: string;
  payload: any;
  status_code: number;
  external_timestamp?: string;
  created_at: string;
}

export interface Lead {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  status: LeadStatus;
  source: string;
  assigned_to: User | null;
  created_at: string;
  updated_at: string;
  logs?: WebhookLog[];
  activities?: LeadActivity[];
}

export interface PipelineStats {
  status: LeadStatus;
  count: number;
}

export interface SourceStats {
  source: string;
  count: number;
}

export interface WebhookSummary {
  total: number;
  success: number;
  failed: number;
}

export interface DashboardStats {
  pipeline: PipelineStats[];
  sources: SourceStats[];
  stuck_leads: number;
  webhooks: WebhookSummary;
  recent_webhooks: WebhookLog[];
  recent_activities: LeadActivity[];
}
