import { create } from 'zustand'

export interface ActivityEntry {
  id: string
  message: string
  module: 'property' | 'lead' | 'site_visit'
  refId?: string
  timestamp: string
}

interface ActivityStore {
  entries: ActivityEntry[]
  log: (message: string, module: ActivityEntry['module'], refId?: string) => void
}

// Shared, in-memory (session-only until a real backend persists it) activity
// feed — every module logs into the same list so the Dashboard can show one
// unified "what just happened" view instead of siloed per-module logs.
export const useActivityStore = create<ActivityStore>((set) => ({
  entries: [],
  log: (message, module, refId) => {
    set(state => ({
      entries: [
        { id: crypto.randomUUID(), message, module, refId, timestamp: new Date().toISOString() },
        ...state.entries,
      ].slice(0, 100),
    }))
  },
}))
