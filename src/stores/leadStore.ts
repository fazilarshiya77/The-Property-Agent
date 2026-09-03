import { create } from 'zustand'
import { type Lead } from '../data/leads'
import { supabase } from '../lib/supabase'
import { useActivityStore } from './activityStore'
import { logToGoogleSheet } from '../lib/logger'

interface LeadStore {
  leads: Lead[]
  loading: boolean
  error: string | null
  fetchLeads: () => Promise<void>
  addLead: (lead: Omit<Lead, 'id' | 'leadCode' | 'createdAt' | 'updatedAt'>) => Promise<Lead>
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  getLeadById: (id: string) => Lead | undefined
}

const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toSnakeCase)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.replace(/([A-Z])/g, '_$1').toLowerCase()] = toSnakeCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = toCamelCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  getLeadById: (id) => get().leads.find(l => l.id === id),

  fetchLeads: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
      set({ loading: false, error: error.message })
      return
    }
    set({ leads: toCamelCase(data ?? []), loading: false })
  },

  addLead: async (lead) => {
    const { data, error } = await supabase
      .from('leads')
      .insert([toSnakeCase(lead)])
      .select()
      .single()

    if (error) {
      console.error('Error adding lead:', error)
      throw error
    }

    const newLead = toCamelCase(data) as Lead

    // Activity entry for the insert is written by the DB trigger (covers
    // website-sourced enquiries too) — nothing to log here.
    set(state => ({ leads: [...state.leads, newLead] }))
    logToGoogleSheet({
      logType: 'CONTACT_FORM',
      message: `Lead Added: ${newLead.name}`,
      details: { id: newLead.id, leadCode: newLead.leadCode, phone: newLead.phone, source: newLead.source, status: newLead.status },
    })
    return newLead
  },

  updateLead: async (id, updates) => {
    const existing = get().leads.find(l => l.id === id)

    const { data, error } = await supabase
      .from('leads')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead:', error)
      throw error
    }

    const updated = toCamelCase(data) as Lead
    const statusChanged = updates.status && existing && updates.status !== existing.status
    const message = statusChanged
      ? `Lead "${existing!.name}" moved to ${updates.status}`
      : `Updated lead "${existing?.name || id}"`

    set(state => ({ leads: state.leads.map(l => l.id === id ? updated : l) }))
    useActivityStore.getState().log(message, 'lead', id)
  },

  deleteLead: async (id) => {
    const lead = get().leads.find(l => l.id === id)

    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) {
      console.error('Error deleting lead:', error)
      throw error
    }

    set(state => ({ leads: state.leads.filter(l => l.id !== id) }))
    useActivityStore.getState().log(`Deleted lead "${lead?.name || id}"`, 'lead', id)
  },
}))
