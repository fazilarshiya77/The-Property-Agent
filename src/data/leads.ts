export type LeadStatus = 'new' | 'contacted' | 'interested' | 'site_visit_planned' | 'site_visit_completed' | 'negotiation' | 'converted' | 'lost';
export type LeadTemperature = 'hot' | 'warm' | 'cold';
export type LeadSource = 'website' | 'whatsapp' | 'instagram' | 'facebook' | 'google' | 'referral' | 'direct' | 'other';
export type LeadPurpose = 'investment' | 'personal_use' | 'rental' | 'farming' | 'vacation';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  site_visit_planned: 'Site Visit Planned',
  site_visit_completed: 'Site Visit Completed',
  negotiation: 'Negotiation',
  converted: 'Converted',
  lost: 'Lost',
};

export const LEAD_STATUS_TONE: Record<LeadStatus, 'neutral' | 'info' | 'success' | 'gold' | 'critical'> = {
  new: 'neutral',
  contacted: 'info',
  interested: 'info',
  site_visit_planned: 'gold',
  site_visit_completed: 'gold',
  negotiation: 'gold',
  converted: 'success',
  lost: 'critical',
};

export const LEAD_TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website: 'Website',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  referral: 'Referral',
  direct: 'Direct',
  other: 'Other',
};

export const LEAD_PURPOSE_LABELS: Record<LeadPurpose, string> = {
  investment: 'Investment',
  personal_use: 'Personal Use',
  rental: 'Rental',
  farming: 'Farming',
  vacation: 'Vacation',
};

export interface Lead {
  id: string;
  leadCode: string; // e.g. LD-00001
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  interestedPropertyId?: string;
  propertyTypeInterested?: string;
  preferredLocation?: string;
  budget?: string;
  purpose?: LeadPurpose;
  source: LeadSource;
  status: LeadStatus;
  temperature: LeadTemperature;
  notes?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export function generateLeadCode(existingCount: number): string {
  return `LD-${String(existingCount + 1).padStart(5, '0')}`;
}
