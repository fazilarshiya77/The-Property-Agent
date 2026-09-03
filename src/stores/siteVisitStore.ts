import { create } from 'zustand'
import { type SiteVisit } from '../data/siteVisits'
import { supabase } from '../lib/supabase'
import { useActivityStore } from './activityStore'

interface SiteVisitStore {
  visits: SiteVisit[]
  loading: boolean
  error: string | null
  fetchVisits: () => Promise<void>
  addVisit: (visit: Omit<SiteVisit, 'id' | 'visitCode' | 'createdAt' | 'updatedAt'>) => Promise<SiteVisit>
  updateVisit: (id: string, updates: Partial<SiteVisit>) => Promise<void>
  deleteVisit: (id: string) => Promise<void>
  getVisitById: (id: string) => SiteVisit | undefined
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

// Session-only, in-memory CRUD store — same pattern as propertyStore/leadStore.
export const useSiteVisitStore = create<SiteVisitStore>((set, get) => ({
  visits: [],
  loading: false,
  error: null,

  getVisitById: (id) => get().visits.find(v => v.id === id),

  fetchVisits: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('site_visits')
      .select('*')
      .order('visit_date', { ascending: true })

    if (error) {
      console.error('Error fetching site visits:', error)
      set({ loading: false, error: error.message })
      return
    }
    set({ visits: toCamelCase(data ?? []), loading: false })
  },

  addVisit: async (visit) => {
    const { data, error } = await supabase
      .from('site_visits')
      .insert([toSnakeCase(visit)])
      .select()
      .single()

    if (error) {
      console.error('Error adding site visit:', error)
      throw error
    }

    const newVisit = toCamelCase(data) as SiteVisit
    // DB trigger logs the insert — nothing to log here.
    set(state => ({ visits: [...state.visits, newVisit] }))
    return newVisit
  },

  updateVisit: async (id, updates) => {
    const existing = get().visits.find(v => v.id === id)

    const { data, error } = await supabase
      .from('site_visits')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating site visit:', error)
      throw error
    }

    const updated = toCamelCase(data) as SiteVisit
    const statusChanged = updates.status && existing && updates.status !== existing.status
    const message = statusChanged
      ? `Visit for "${existing!.leadName}" marked ${updates.status}`
      : `Updated visit for "${existing?.leadName || id}"`

    set(state => ({ visits: state.visits.map(v => v.id === id ? updated : v) }))
    useActivityStore.getState().log(message, 'site_visit', id)
  },

  deleteVisit: async (id) => {
    const visit = get().visits.find(v => v.id === id)

    const { error } = await supabase.from('site_visits').delete().eq('id', id)
    if (error) {
      console.error('Error deleting site visit:', error)
      throw error
    }

    set(state => ({ visits: state.visits.filter(v => v.id !== id) }))
    useActivityStore.getState().log(`Deleted visit for "${visit?.leadName || id}"`, 'site_visit', id)
  },
}))
