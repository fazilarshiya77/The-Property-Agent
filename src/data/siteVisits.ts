export type VisitStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rescheduled: 'Rescheduled',
};

export const VISIT_STATUS_TONE: Record<VisitStatus, 'neutral' | 'info' | 'success' | 'gold' | 'critical'> = {
  scheduled: 'info',
  confirmed: 'gold',
  completed: 'success',
  cancelled: 'critical',
  rescheduled: 'neutral',
};

export interface SiteVisit {
  id: string;
  visitCode: string; // e.g. SV-00001
  leadId?: string;
  leadName: string;
  propertyId?: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  status: VisitStatus;
  feedback?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function generateVisitCode(existingCount: number): string {
  return `SV-${String(existingCount + 1).padStart(5, '0')}`;
}
