import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface SiteSettings {
  /** One or more call numbers, in display order — callNumbers[0] is the
   *  "primary" number used anywhere the site only shows a single Call CTA. */
  callNumbers: string[]
  whatsappNumber: string
  businessName: string
  businessEmail: string
}

// No fake/hardcoded phone numbers as a fallback: callNumbers/whatsappNumber
// start empty and stay empty if the row hasn't loaded yet, doesn't exist,
// or Supabase is unreachable. Consuming components treat an empty
// value/array as "not configured" and hide/disable that CTA rather than
// ever showing or dialing a made-up number.
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  callNumbers: [],
  whatsappNumber: '',
  businessName: 'The Property Agent',
  businessEmail: 'thepropertyagent129@gmail.com',
}

interface SettingsStore {
  settings: SiteSettings
  loading: boolean
  loaded: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (partial: Partial<SiteSettings>) => Promise<{ error: string | null }>
}

const fromRow = (row: any): SiteSettings => ({
  callNumbers: Array.isArray(row.call_numbers) ? row.call_numbers.filter(Boolean) : [],
  whatsappNumber: row.whatsapp_number || '',
  businessName: row.business_name || DEFAULT_SITE_SETTINGS.businessName,
  businessEmail: row.business_email || DEFAULT_SITE_SETTINGS.businessEmail,
})

// Single-row settings table (id = 1) holding the business's Call/WhatsApp
// numbers (and a couple of business-info fields) so they're editable from
// the admin CRM instead of hardcoded across the public site. Public visitors
// get read-only access via RLS; only an authenticated admin can update it.
export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SITE_SETTINGS,
  loading: false,
  loaded: false,

  fetchSettings: async () => {
    if (get().loading) return
    set({ loading: true })

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error || !data) {
      if (error) console.error('Error fetching site settings:', error)
      set({ loading: false, loaded: true })
      return
    }

    set({ settings: fromRow(data), loading: false, loaded: true })
  },

  updateSettings: async (partial) => {
    const payload: Record<string, string | string[]> = {}
    if (partial.callNumbers !== undefined) payload.call_numbers = partial.callNumbers
    if (partial.whatsappNumber !== undefined) payload.whatsapp_number = partial.whatsappNumber
    if (partial.businessName !== undefined) payload.business_name = partial.businessName
    if (partial.businessEmail !== undefined) payload.business_email = partial.businessEmail

    const { data, error } = await supabase
      .from('site_settings')
      .update(payload)
      .eq('id', 1)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error updating site settings:', error)
      return { error: error.message }
    }

    if (data) set({ settings: fromRow(data) })
    return { error: null }
  },
}))
