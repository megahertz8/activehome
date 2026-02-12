import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase-client'
import { useState } from 'react'

export default function UserMenu() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) {
    return <button onClick={() => window.location.href = '/auth/login'}>Sign In</button>
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center">
        <img src={user.user_metadata.avatar_url || '/default-avatar.png'} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
        {user.user_metadata.full_name || user.email}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-card border border-border rounded shadow-lg text-foreground">
          <a href="/dashboard" className="block px-4 py-2 hover:bg-muted">Dashboard</a>
          <a href="/dashboard/settings" className="block px-4 py-2 hover:bg-muted">Settings</a>
          <button onClick={handleSignOut} className="block px-4 py-2 w-full text-left hover:bg-muted">Sign Out</button>
        </div>
      )}
    </div>
  )
}