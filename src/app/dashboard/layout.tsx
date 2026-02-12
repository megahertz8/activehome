"use client";

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, LogOut, Menu, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UserMenu from '@/components/auth/UserMenu'
import { useAuth } from '@/components/auth/AuthProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              Evolving Home
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Quick Add Home */}
          <div className="p-4 border-t border-border">
            <Link href="/?scan=true">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Scan New Home
              </Button>
            </Link>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground hover:text-destructive"
              onClick={async () => {
                const { supabase } = await import('@/lib/supabase-client')
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            Evolving Home
          </Link>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}