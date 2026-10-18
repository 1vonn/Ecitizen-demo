import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  ensureSupabaseProfile,
  fetchUserProfile,
  getLocalSession,
  setLocalSession,
} from '../lib/database'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getLocalSession())
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) {
          setAuthLoading(false)
        }
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session?.user) {
          const sbUser = data.session.user
          const profile = await fetchUserProfile(sbUser.id)
          const mergedUser = {
            id: sbUser.id,
            email: sbUser.email,
            fullName:
              profile?.full_name ||
              sbUser.user_metadata?.full_name ||
              sbUser.email?.split('@')[0] ||
              'Citizen',
            phone: profile?.phone || sbUser.user_metadata?.phone || '',
            nationalId:
              profile?.national_id || sbUser.user_metadata?.national_id || '',
            role: profile?.role || sbUser.user_metadata?.role || 'citizen',
          }
          if (!profile) {
            await ensureSupabaseProfile(mergedUser)
          }
          if (mounted) {
            setUser(mergedUser)
            setLocalSession(mergedUser)
          }
        } else if (mounted) {
          setUser(null)
          setLocalSession(null)
        }
      } catch {
        // Keep current state on transient network error
      } finally {
        if (mounted) setAuthLoading(false)
      }
    }

    initAuth()

    if (isSupabaseConfigured && supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(
        async (_event, nextSession) => {
          if (nextSession?.user) {
            const sbUser = nextSession.user
            const profile = await fetchUserProfile(sbUser.id)
            const mergedUser = {
              id: sbUser.id,
              email: sbUser.email,
              fullName:
                profile?.full_name ||
                sbUser.user_metadata?.full_name ||
                sbUser.email?.split('@')[0] ||
                'Citizen',
              phone: profile?.phone || sbUser.user_metadata?.phone || '',
              nationalId:
                profile?.national_id || sbUser.user_metadata?.national_id || '',
              role: profile?.role || sbUser.user_metadata?.role || 'citizen',
            }
            setUser(mergedUser)
            setLocalSession(mergedUser)
          } else {
            setUser(null)
            setLocalSession(null)
          }
        }
      )
      return () => {
        mounted = false
        listener.subscription.unsubscribe()
      }
    }

    return () => {
      mounted = false
    }
  }, [])

  async function signUp({
    fullName,
    email,
    phone = '',
    nationalId = '',
    password,
    role = 'citizen',
  }) {
    const cleanEmail = email.trim().toLowerCase()
    const cleanName = fullName.trim()

    if (!isSupabaseConfigured || !supabase) {
      return {
        user: null,
        error: 'Supabase is not configured. Please check your .env settings.',
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          phone: phone.trim(),
          national_id: nationalId.trim(),
          role,
        },
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      return {
        user: null,
        error: error.message.toLowerCase().includes('already')
          ? 'An account with this email address already exists. Please sign in.'
          : error.message,
      }
    }

    if (data?.user) {
      const newUser = {
        id: data.user.id,
        email: cleanEmail,
        fullName: cleanName,
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        role,
      }
      await ensureSupabaseProfile(newUser)

      setUser(newUser)
      setLocalSession(newUser)
      return {
        user: newUser,
        error: null,
        needsConfirmation: false,
      }
    }

    return {
      user: null,
      error: 'Unable to complete registration. Please try again.',
    }
  }

  async function signIn({ email, password }) {
    const cleanEmail = email.trim().toLowerCase()

    if (!isSupabaseConfigured || !supabase) {
      return {
        user: null,
        error: 'Supabase is not configured. Please check your .env settings.',
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error || !data?.user) {
      return {
        user: null,
        error: error?.message || 'Invalid email or password. Please try again.',
      }
    }

    const sbUser = data.user
    const profile = await fetchUserProfile(sbUser.id)
    const verifiedRole =
      profile?.role === 'admin' || sbUser.user_metadata?.role === 'admin'
        ? 'admin'
        : 'citizen'
    const signedInUser = {
      id: sbUser.id,
      email: sbUser.email,
      fullName:
        profile?.full_name ||
        sbUser.user_metadata?.full_name ||
        sbUser.email?.split('@')[0] ||
        'Citizen',
      phone: profile?.phone || sbUser.user_metadata?.phone || '',
      nationalId:
        profile?.national_id || sbUser.user_metadata?.national_id || '',
      role: verifiedRole,
    }
    if (!profile) {
      await ensureSupabaseProfile(signedInUser)
    }
    setUser(signedInUser)
    setLocalSession(signedInUser)
    return { user: signedInUser, error: null }
  }

  async function signOut() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch {
        // Ignore signOut network errors
      }
    }
    setUser(null)
    setLocalSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
