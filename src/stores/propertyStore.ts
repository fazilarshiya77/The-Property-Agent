import { create } from 'zustand'
import { type Property, defaultProperties } from '../data/properties'
import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'
import { logToGoogleSheet } from '../lib/logger'

interface PropertyStore {
  properties: Property[]
  loading: boolean
  error: string | null
  fetchProperties: () => Promise<void>
  addProperty: (property: Omit<Property, 'id'>) => Promise<void>
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  getPropertyById: (id: string) => Property | undefined
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    // Get admin credentials from Supabase
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('password_hash')
      .eq('username', 'admin')
      .single()

    if (error || !data) {
      console.error('Error fetching admin credentials:', error)
      return false
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, data.password_hash)

    logToGoogleSheet({
      logType: 'ADMIN_LOGIN',
      message: isValid ? 'Admin Login Successful' : 'Admin Login Failed - Invalid Password',
      details: {
        username: 'admin',
        status: isValid ? 'SUCCESS' : 'FAILED',
      },
    })

    return isValid
  } catch (err) {
    console.error('Error verifying password:', err)
    logToGoogleSheet({
      logType: 'ADMIN_LOGIN',
      message: 'Admin Login Failed - Error',
      details: {
        username: 'admin',
        status: 'ERROR',
        error: (err as Error).message,
      },
    })
    return false
  }
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
    return result
  }
  return obj
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  loading: false,
  error: null,

  getPropertyById: (id: string) => {
    return get().properties.find(p => p.id === id)
  },

  fetchProperties: async () => {
    set({ loading: true, error: null });
    try {
      // Use default properties directly
      set({ properties: defaultProperties, loading: false });
    } catch (err) {
      console.error('Error fetching properties:', err);
      set({ properties: defaultProperties, loading: false, error: 'Failed to fetch properties' });
    }
  },

  addProperty: async (property) => {
    const id = crypto.randomUUID()
    const newProperty = { ...property, id } as Property
    
    const { error } = await supabase
      .from('properties')
      .insert([toSnakeCase(newProperty)])
    
    if (error) {
      console.error('Error adding property:', error)
      logToGoogleSheet({
        logType: 'ERROR',
        message: 'Failed to Add Property',
        details: { id, title: property.title, error: error.message },
      })
      throw error
    }
    
    logToGoogleSheet({
      logType: 'PROPERTY_ADD',
      message: `Property Added: ${newProperty.title}`,
      details: {
        id: newProperty.id,
        title: newProperty.title,
        location: newProperty.location,
        price: newProperty.price,
        type: newProperty.type,
      },
    })

    set(state => ({ properties: [...state.properties, newProperty] }))
  },

  updateProperty: async (id, updates) => {
    const { error } = await supabase
      .from('properties')
      .update(toSnakeCase(updates))
      .eq('id', id)
    
    if (error) {
      console.error('Error updating property:', error)
      logToGoogleSheet({
        logType: 'ERROR',
        message: 'Failed to Update Property',
        details: { id, updates, error: error.message },
      })
      throw error
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

    set(state => ({
      properties: state.properties.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }))
  },

  deleteProperty: async (id) => {
    const property = get().properties.find(p => p.id === id)
    
    if (property) {
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
    }

    // Delete property from database
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting property:', error)
      logToGoogleSheet({
        logType: 'ERROR',
        message: 'Failed to Delete Property',
        details: { id, error: error.message },
      })
      throw error
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
      properties: state.properties.filter(p => p.id !== id)
    }))
  }
}))
