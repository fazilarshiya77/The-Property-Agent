import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface ActivityEntry {
  id: string
  message: string
  module: 'property' | 'lead' | 'site_visit'
  refId?: string
  timestamp: string
}

interface ActivityStore {
  entries: ActivityEntry[]
  loading: boolean
  fetchActivity: () => Promise<void>
  log: (message: string, module: ActivityEntry['module'], refId?: string) => void
}

const fromRow = (row: any): ActivityEntry => ({
  id: row.id,
  message: row.message,
  module: row.module,
  refId: row.ref_id ?? undefined,
  timestamp: row.created_at,
})

// Shared activity feed — every module logs into the same table so the
// Dashboard can show one unified "what just happened" view. INSERT-time
// entries (new property/lead/site visit) come from DB triggers, so they
// show up on the next fetch without any client-side log() call; UPDATE and
// DELETE paths (admin-only, no trigger covers them) log directly here.
export const useActivityStore = create<ActivityStore>((set) => ({
  entries: [],
  loading: false,

  fetchActivity: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching activity log:', error)
      set({ loading: false })
      return
    }
    set({ entries: (data ?? []).map(fromRow), loading: false })
  },

  log: (message, module, refId) => {
    // Optimistic local entry so the feed feels instant; persisted async.
    const optimistic: ActivityEntry = {
      id: crypto.randomUUID(),
      message,
      module,
      refId,
      timestamp: new Date().toISOString(),
    }
    set(state => ({ entries: [optimistic, ...state.entries].slice(0, 100) }))

    supabase
      .from('activity_log')
      .insert([{ message, module, ref_id: refId ?? null }])
      .then(({ error }) => {
        if (error) console.error('Error logging activity:', error)
      })
  },
}))
