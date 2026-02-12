"use client";

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, CreditCard, Users, Shield, Trash2, Copy, Check } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  credits: number
  plan: string
  referral_code: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [copiedReferral, setCopiedReferral] = useState(false)
  const [authMethods, setAuthMethods] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchAuthMethods()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { supabase } = await import('@/lib/supabase-client')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (data && !error) {
        setProfile(data)
      } else {
        // Create profile if it doesn't exist
        if (user) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || '',
              credits: 0,
              plan: 'free'
            })
            .select()
            .single()

          if (newProfile && !createError) {
            setProfile(newProfile)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthMethods = async () => {
    try {
      const { supabase } = await import('@/lib/supabase-client')
      const { data, error } = await supabase.auth.getUser()

      if (data.user && !error) {
        const methods = []
        if (data.user.app_metadata?.provider === 'google') methods.push('Google')
        if (data.user.app_metadata?.provider === 'apple') methods.push('Apple')
        if (data.user.email) methods.push('Email')
        setAuthMethods(methods)
      }
    } catch (error) {
      console.error('Failed to fetch auth methods:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return

    setSaving(true)
    try {
      const { supabase } = await import('@/lib/supabase-client')
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single()

      if (data && !error) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return

    try {
      const { supabase } = await import('@/lib/supabase-client')
      // Delete user's data
      await supabase.from('saved_homes').delete().eq('user_id', user?.id)
      await supabase.from('profiles').delete().eq('id', user?.id)

      // Delete auth user
      await supabase.auth.admin.deleteUser(user?.id || '')

      // Sign out
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  const copyReferralCode = async () => {
    if (!profile?.referral_code) return

    try {
      await navigator.clipboard.writeText(profile.referral_code)
      setCopiedReferral(true)
      setTimeout(() => setCopiedReferral(false), 2000)
    } catch (error) {
      console.error('Failed to copy referral code:', error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">⚙️</div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </div>
              <Button
                onClick={() => updateProfile({ full_name: profile?.full_name || '' })}
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Plan & Credits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Plan & Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Plan</span>
                <Badge variant={profile?.plan === 'pro' ? 'default' : 'secondary'}>
                  {profile?.plan === 'pro' ? 'Pro' : 'Free'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Credits Balance</span>
                <span className="text-2xl font-bold text-primary">{profile?.credits || 0}</span>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>Earn credits by:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Scanning homes (25 credits each)</li>
                  <li>Referring friends (50 credits per referral)</li>
                  <li>Monthly bonuses for Pro members</li>
                </ul>
              </div>
              {profile?.plan === 'free' && (
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Referral Program */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Referral Program
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Referral Code</Label>
                <div className="flex space-x-2">
                  <Input
                    value={profile?.referral_code || 'Generating...'}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyReferralCode}
                    disabled={!profile?.referral_code}
                  >
                    {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Share your referral code with friends. When they sign up and scan their first home, you both earn 50 credits!</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Referral Link</p>
                <p className="text-xs text-muted-foreground break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}?ref=${profile?.referral_code}` : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Connected Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Connected Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {authMethods.map((method) => (
                  <div key={method} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {method === 'Google' && 'G'}
                        {method === 'Apple' && '🍎'}
                        {method === 'Email' && '✉️'}
                      </div>
                      <span className="font-medium">{method}</span>
                    </div>
                    <Badge variant="secondary">Connected</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Connected accounts allow you to sign in easily and securely.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. All your data, including saved homes and credits, will be permanently deleted.
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm">
                    Are you sure you want to delete your account? This action cannot be undone.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Type "DELETE" to confirm</Label>
                    <Input
                      id="confirm"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== 'DELETE'}
                      className="flex-1"
                    >
                      Yes, Delete My Account
                    </Button>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </DialogTrigger>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}