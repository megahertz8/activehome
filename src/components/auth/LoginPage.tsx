"use client";

import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) alert(error.message)
  }

  const handleApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) alert(error.message)
  }

  return (
    <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign In to Evolving Home</h1>
        <form onSubmit={handleMagicLink} className="mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#4ecdc4] text-black p-3 rounded font-semibold"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
        <div className="text-center text-gray-400 mb-4">or</div>
        <button
          onClick={handleGoogle}
          className="w-full bg-white text-black p-3 rounded font-semibold mb-2"
        >
          Continue with Google
        </button>
        <button
          onClick={handleApple}
          className="w-full bg-black text-white p-3 rounded font-semibold"
        >
          Continue with Apple
        </button>
      </div>
    </div>
  )
}