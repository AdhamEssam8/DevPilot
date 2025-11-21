'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    let subscription: { unsubscribe: () => void } | null = null

    const handleAuthCallback = async () => {
      try {
        // Check for error in hash fragment
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const error = hashParams.get('error')
          const errorDescription = hashParams.get('error_description')

          if (error) {
            console.error('Auth error:', error, errorDescription)
            router.push(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`)
            return
          }
        }

        setStatus('Verifying your account...')
        
        // Listen for auth state changes - Supabase will automatically process the hash
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session) {
              setStatus('Authentication successful! Redirecting...')
              // Clear the hash from URL
              if (typeof window !== 'undefined') {
                window.history.replaceState(null, '', window.location.pathname)
              }
              if (timeoutId) clearTimeout(timeoutId)
              timeoutId = setTimeout(() => {
                router.push('/')
              }, 500)
            }
          }
        })
        subscription = authSubscription

        // Fallback: Check session after a delay
        const fallbackTimeoutId = setTimeout(async () => {
          if (!mounted) return
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            router.push(`/auth/login?error=${encodeURIComponent(sessionError.message)}`)
            return
          }

          if (session) {
            setStatus('Authentication successful! Redirecting...')
            if (typeof window !== 'undefined') {
              window.history.replaceState(null, '', window.location.pathname)
            }
            setTimeout(() => {
              router.push('/')
            }, 500)
          } else {
            // Wait a bit more if hash exists
            if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
              setStatus('Still processing...')
              return
            }
            setStatus('No session found. Redirecting to login...')
            setTimeout(() => {
              router.push('/auth/login?error=session_expired')
            }, 1000)
          }
        }, 1000)
        
        // Store timeout for cleanup (only if not already set by auth state change)
        if (!timeoutId) {
          timeoutId = fallbackTimeoutId
        }
      } catch (error: any) {
        console.error('Unexpected error:', error)
        router.push(`/auth/login?error=${encodeURIComponent(error.message || 'unexpected_error')}`)
      }
    }

    handleAuthCallback()
    
    return () => {
      mounted = false
      if (subscription) subscription.unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}
