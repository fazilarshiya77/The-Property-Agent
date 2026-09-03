import { create } from 'zustand'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthStore {
  session: Session | null
  initialized: boolean
}

export const useAuthStore = create<AuthStore>(() => ({
  session: null,
  initialized: false,
}))

// Self-initializing: restores any existing session once on load, then
// keeps `session` in sync with every sign-in/sign-out from anywhere in the
// app (AdminLogin, AdminLayout's logout button, token refresh, etc.).
supabase.auth.getSession().then(({ data }) => {
  useAuthStore.setState({ session: data.session, initialized: true })
})
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session, initialized: true })
})

/** True once we actually know (session restore finished) whether an admin is signed in. */
export function isAdminAuthenticated(): boolean {
  return useAuthStore.getState().session !== null
}

/**
 * Drop-in replacement for the old synchronous `if (!isAdminAuthenticated())
 * return null` guard used at the top of every admin page. Session restore
 * is async, so pages need to wait for `initialized` before deciding whether
 * to redirect — otherwise a real, logged-in admin gets bounced to /admin on
 * every hard refresh during the brief window before the session loads.
 *
 * Usage in a page component:
 *   const ready = useAdminGuard();
 *   if (!ready) return null; // loading or redirecting
 */
export function useAdminGuard(): boolean {
  const navigate = useNavigate()
  const { session, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized && !session) navigate('/admin')
  }, [initialized, session, navigate])

  return initialized && session !== null
}
