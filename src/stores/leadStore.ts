import { create } from 'zustand'
import { type Lead, generateLeadCode } from '../data/leads'
import { useActivityStore } from './activityStore'
import { logToGoogleSheet } from '../lib/logger'

interface LeadStore {
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'leadCode' | 'createdAt' | 'updatedAt'>) => Lead
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void
  getLeadById: (id: string) => Lead | undefined
}

// Session-only, in-memory CRUD store — same pattern as propertyStore.
// Swap for real Supabase-backed persistence once credentials are connected.
export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],

  getLeadById: (id) => get().leads.find(l => l.id === id),

  addLead: (lead) => {
    const now = new Date().toISOString()
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      leadCode: generateLeadCode(get().leads.length),
      createdAt: now,
      updatedAt: now,
    }
    set(state => ({ leads: [...state.leads, newLead] }))
    useActivityStore.getState().log(`New lead: ${newLead.name} (${newLead.leadCode})`, 'lead', newLead.id)
    logToGoogleSheet({
      logType: 'CONTACT_FORM',
      message: `Lead Added: ${newLead.name}`,
      details: { id: newLead.id, leadCode: newLead.leadCode, phone: newLead.phone, source: newLead.source, status: newLead.status },
    })
    return newLead
  },

  updateLead: (id, updates) => {
    const existing = get().leads.find(l => l.id === id)
    const statusChanged = updates.status && existing && updates.status !== existing.status
    const message = statusChanged
      ? `Lead "${existing!.name}" moved to ${updates.status}`
      : `Updated lead "${existing?.name || id}"`

    set(state => ({
      leads: state.leads.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l),
    }))
    useActivityStore.getState().log(message, 'lead', id)
  },

  deleteLead: (id) => {
    const lead = get().leads.find(l => l.id === id)
    set(state => ({ leads: state.leads.filter(l => l.id !== id) }))
    useActivityStore.getState().log(`Deleted lead "${lead?.name || id}"`, 'lead', id)
  },
}))
