// Supabase has been removed from this project for now.
// This file provides a drop-in, no-op replacement for the `supabase` client so
// the rest of the codebase (property store, admin auth, image/video upload)
// keeps compiling and running without the @supabase/* packages installed.
//
// Every call resolves with a "not configured" error, which the callers
// already handle gracefully (e.g. propertyStore falls back to local
// defaultProperties). Swap this file for a real client again when a backend
// is wired back up.

type MaybeError = { message: string } | null

const NOT_CONFIGURED: MaybeError = {
  message: 'Supabase is not configured. This app is currently running without a backend.',
}

function notConfigured<T = any>(): { data: T | null; error: MaybeError } {
  return { data: null, error: NOT_CONFIGURED }
}

class QueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: MaybeError }> {
  select(_columns?: string) {
    return this
  }
  order(_column: string, _opts?: { ascending?: boolean }) {
    return this
  }
  eq(_column: string, _value: unknown) {
    return this
  }
  single() {
    return this
  }
  insert(_rows: unknown[]) {
    return this
  }
  update(_values: unknown) {
    return this
  }
  delete() {
    return this
  }
  then<TResult1 = { data: T | null; error: MaybeError }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: MaybeError }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(notConfigured<T>()).then(onfulfilled, onrejected)
  }
}

const storageBucket = {
  upload(_path: string, _file: File, _opts?: Record<string, unknown>) {
    return Promise.resolve(notConfigured())
  },
  remove(_paths: string[]) {
    return Promise.resolve(notConfigured())
  },
  getPublicUrl(path: string) {
    return { data: { publicUrl: path } }
  },
}

export const supabase = {
  from(_table: string) {
    return new QueryBuilder()
  },
  storage: {
    from(_bucket: string) {
      return storageBucket
    },
  },
  auth: {
    signInWithPassword(_credentials: { email: string; password: string }) {
      return Promise.resolve({ data: { user: null }, error: NOT_CONFIGURED })
    },
  },
}
