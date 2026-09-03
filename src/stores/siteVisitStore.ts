import { create } from 'zustand'
import { type SiteVisit, generateVisitCode } from '../data/siteVisits'
import { useActivityStore } from './activityStore'

interface SiteVisitStore {
  visits: SiteVisit[]
  addVisit: (visit: Omit<SiteVisit, 'id' | 'visitCode' | 'createdAt' | 'updatedAt'>) => SiteVisit
  updateVisit: (id: string, updates: Partial<SiteVisit>) => void
  deleteVisit: (id: string) => void
  getVisitById: (id: string) => SiteVisit | undefined
}

// Session-only, in-memory CRUD store — same pattern as propertyStore/leadStore.
export const useSiteVisitStore = create<SiteVisitStore>((set, get) => ({
  visits: [],

  getVisitById: (id) => get().visits.find(v => v.id === id),

  addVisit: (visit) => {
    const now = new Date().toISOString()
    const newVisit: SiteVisit = {
      ...visit,
      id: crypto.randomUUID(),
      visitCode: generateVisitCode(get().visits.length),
      createdAt: now,
      updatedAt: now,
    }
    set(state => ({ visits: [...state.visits, newVisit] }))
    useActivityStore.getState().log(`Site visit scheduled: ${newVisit.leadName} → ${newVisit.propertyTitle} (${newVisit.visitDate})`, 'site_visit', newVisit.id)
    return newVisit
  },

  updateVisit: (id, updates) => {
    const existing = get().visits.find(v => v.id === id)
    const statusChanged = updates.status && existing && updates.status !== existing.status
    const message = statusChanged
      ? `Visit for "${existing!.leadName}" marked ${updates.status}`
      : `Updated visit for "${existing?.leadName || id}"`

    set(state => ({
      visits: state.visits.map(v => v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v),
    }))
    useActivityStore.getState().log(message, 'site_visit', id)
  },

  deleteVisit: (id) => {
    const visit = get().visits.find(v => v.id === id)
    set(state => ({ visits: state.visits.filter(v => v.id !== id) }))
    useActivityStore.getState().log(`Deleted visit for "${visit?.leadName || id}"`, 'site_visit', id)
  },
}))
