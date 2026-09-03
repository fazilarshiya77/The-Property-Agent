import { create } from 'zustand'
import { type Property, defaultProperties, generatePropertyCode } from '../data/properties'
import { supabase } from '../lib/supabase'
import { logToGoogleSheet } from '../lib/logger'
import { useActivityStore } from './activityStore'

interface PropertyStore {
  properties: Property[]
  loading: boolean
  error: string | null
  fetchProperties: () => Promise<void>
  addProperty: (property: Omit<Property, 'id' | 'propertyCode'>) => Promise<void>
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  getPropertyById: (id: string) => Property | undefined
  getPublishedProperties: () => Property[]
}

// True once a real Supabase project is configured (see src/lib/supabase.ts).
// Until then, every write below still updates local state so the CRM is
// fully usable without a backend — the Supabase call is attempted and
// logged, but never blocks the local update.
const hasBackend = Boolean(import.meta.env.VITE_SUPABASE_URL)

// No backend is wired up yet, so admin login checks against a single
// hardcoded email/password pair instead. Set VITE_ADMIN_EMAIL and
// VITE_ADMIN_PASSWORD in .env to override the defaults below — see
// .env.example. Swap this for real Supabase auth once credentials are
// connected (see AdminLogin.tsx).
export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@thepropertyagent.in'
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'Agent#Karnataka26'

  const isValid = email.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPassword

  logToGoogleSheet({
    logType: 'ADMIN_LOGIN',
    message: isValid ? 'Admin Login Successful' : 'Admin Login Failed - Invalid Credentials',
    details: {
      email,
      status: isValid ? 'SUCCESS' : 'FAILED',
    },
  })

  return isValid
}

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem('trishna_admin') === 'true'
}

export function setAdminAuthenticated(value: boolean): void {
  if (value) sessionStorage.setItem('trishna_admin', 'true')
  else sessionStorage.removeItem('trishna_admin')
}

// Convert camelCase to snake_case for database
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      acc[snakeKey] = toSnakeCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

// Convert snake_case to camelCase for application
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  } else if (obj !== null && typeof obj === 'object') {
    const result = Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
      acc[camelKey] = toCamelCase(obj[key])
      return acc
    }, {} as any)
    // Ensure reviews exists
    if (!result.reviews) {
      result.reviews = []
    }
    // Ensure videos exists
    if (!result.videos) {
      result.videos = []
    }
    return result
  }
  return obj
}

export const usePropertyStore = create<PropertyStore & { hasFetched: boolean }>((set, get) => ({
  // Without a backend there's nothing to actually fetch, so seed the local
  // list immediately and mark it "fetched" from the start — otherwise
  // whichever page's fetchProperties() call happens to run first (e.g.
  // landing directly on Add Property) would win a race against every other
  // page's own fetchProperties() call and reset local edits back to empty.
  properties: hasBackend ? [] : defaultProperties,
  loading: false,
  error: null,
  hasFetched: !hasBackend,

  getPropertyById: (id: string) => {
    return get().properties.find(p => p.id === id)
  },

  getPublishedProperties: () => {
    return get().properties.filter(p => p.status === 'published')
  },

  fetchProperties: async () => {
    // Without a backend, every page mount calling fetchProperties() would
    // otherwise reset local edits (added/updated properties) back to
    // defaultProperties on every navigation. Only load once; after that,
    // in-memory state (including anything the admin has added) is the
    // source of truth until a real backend is connected.
    if (!hasBackend) {
      if (!get().hasFetched) {
        set({ properties: defaultProperties, hasFetched: true });
      }
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const camelData = toCamelCase(data);
        const remoteIds = new Set(camelData.map((p: Property) => p.id));
        const missingDefaults = defaultProperties.filter(p => !remoteIds.has(p.id));
        set({ properties: [...camelData, ...missingDefaults], loading: false, hasFetched: true });
      } else {
        set({ properties: defaultProperties, loading: false, hasFetched: true });
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      set({ properties: defaultProperties, loading: false, hasFetched: true, error: 'Failed to fetch properties' });
    }
  },

  addProperty: async (property) => {
    const id = crypto.randomUUID()
    const propertyCode = generatePropertyCode(get().properties.length)
    const now = new Date().toISOString()
    const newProperty = { ...property, id, propertyCode, createdAt: now, updatedAt: now } as Property

    if (hasBackend) {
      const { error } = await supabase
        .from('properties')
        .insert([toSnakeCase(newProperty)])

      if (error) {
        console.error('Error syncing new property to Supabase:', error)
        logToGoogleSheet({
          logType: 'ERROR',
          message: 'Failed to Sync Added Property',
          details: { id, title: property.title, error: error.message },
        })
      }
    }

    logToGoogleSheet({
      logType: 'PROPERTY_ADD',
      message: `Property Added: ${newProperty.title}`,
      details: {
        id: newProperty.id,
        propertyCode: newProperty.propertyCode,
        title: newProperty.title,
        location: newProperty.location,
        price: newProperty.price,
        type: newProperty.type,
        status: newProperty.status,
      },
    })

    set(state => ({ properties: [...state.properties, newProperty] }))
    useActivityStore.getState().log(`Added "${newProperty.title}" (${newProperty.propertyCode}) as ${newProperty.status}`, 'property', id)
  },

  updateProperty: async (id, updates) => {
    const now = new Date().toISOString()
    updates = { ...updates, updatedAt: now }
    if (hasBackend) {
      const { error } = await supabase
        .from('properties')
        .update(toSnakeCase(updates))
        .eq('id', id)

      if (error) {
        console.error('Error syncing property update to Supabase:', error)
        logToGoogleSheet({
          logType: 'ERROR',
          message: 'Failed to Sync Property Update',
          details: { id, updates, error: error.message },
        })
      }
    }

    logToGoogleSheet({
      logType: 'PROPERTY_UPDATE',
      message: `Property Updated: ID ${id}`,
      details: {
        id,
        title: updates.title || '',
        price: updates.price || '',
        location: updates.location || '',
        updates,
      },
    })

    const existing = get().properties.find(p => p.id === id);
    const statusChanged = updates.status && existing && updates.status !== existing.status;
    const message = statusChanged
      ? `"${existing!.title}" marked ${updates.status}`
      : `Updated "${existing?.title || id}"`;

    set(state => ({
      properties: state.properties.map(p => p.id === id ? { ...p, ...updates } : p),
    }))
    useActivityStore.getState().log(message, 'property', id)
  },

  deleteProperty: async (id) => {
    const property = get().properties.find(p => p.id === id)

    if (hasBackend && property) {
      // Delete images from storage first
      for (const imageUrl of property.images) {
        try {
          const path = imageUrl.split('/properties/')[1]
          if (path) {
            await supabase.storage.from('properties').remove([path])
          }
        } catch (err) {
          console.error('Error deleting image:', err)
        }
      }

      // Delete uploaded videos from storage
      if (property.videos && property.videos.length > 0) {
        for (const videoUrl of property.videos) {
          try {
            const path = videoUrl.split('/properties/')[1]
            if (path) {
              await supabase.storage.from('properties').remove([path])
            }
          } catch (err) {
            console.error('Error deleting video:', err)
          }
        }
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error syncing property deletion to Supabase:', error)
        logToGoogleSheet({
          logType: 'ERROR',
          message: 'Failed to Sync Property Deletion',
          details: { id, error: error.message },
        })
      }
    }

    logToGoogleSheet({
      logType: 'PROPERTY_DELETE',
      message: `Property Deleted: ${property?.title || id}`,
      details: {
        id,
        title: property?.title || '',
        location: property?.location || '',
      },
    })

    set(state => ({
      properties: state.properties.filter(p => p.id !== id),
    }))
    useActivityStore.getState().log(`Deleted "${property?.title || id}"`, 'property', id)
  }
}))
