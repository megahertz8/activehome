"use client";

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, Plus, RefreshCw, TrendingUp, TrendingDown, Users, CreditCard, MapPin, Calendar } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete'

interface SavedHome {
  id: string
  address: string
  postcode: string
  current_rating: string
  potential_rating: string
  last_scanned_at: string
  annual_energy_cost: number
  solar_potential_kwh: number
}

interface Profile {
  credits: number
  referral_code?: string
}

function ratingColor(rating: string): string {
  const colors: Record<string, string> = {
    A: "#00c781", B: "#19b459", C: "#8dce46",
    D: "#ffd500", E: "#fcaa65", F: "#ef8023", G: "#e9153b",
  };
  return colors[rating?.toUpperCase()] || "#8b949e";
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [homes, setHomes] = useState<SavedHome[]>([])
  const [profile, setProfile] = useState<Profile>({ credits: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (user) {
      fetchHomes()
      fetchProfile()
    }
  }, [user])

  const fetchHomes = async () => {
    try {
      const response = await fetch('/api/homes')
      if (response.ok) {
        const data = await response.json()
        setHomes(data)
      }
    } catch (error) {
      console.error('Failed to fetch homes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const { supabase } = await import('@/lib/supabase-client')
      const { data, error } = await supabase
        .from('profiles')
        .select('credits, referral_code')
        .eq('id', user?.id)
        .single()

      if (data && !error) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleScanHome = async () => {
    if (!selectedPlace?.geometry?.location) return

    setScanning(true)
    try {
      // Extract postcode from address components
      const postcode = selectedPlace.address_components?.find(
        component => component.types.includes('postal_code')
      )?.long_name || '';

      if (!postcode) {
        alert('Could not extract postcode from selected address. Please try again.');
        setScanning(false);
        return;
      }

      // Get lat/lng for geocoding
      const lat = selectedPlace.geometry.location.lat();
      const lng = selectedPlace.geometry.location.lng();

      window.location.href = `/?postcode=${encodeURIComponent(postcode)}&lat=${lat}&lng=${lng}&scan=true`
    } catch (error) {
      console.error('Failed to scan home:', error)
      setScanning(false)
    }
  }

  const calculateStats = () => {
    if (homes.length === 0) return null

    const totalSavings = homes.reduce((sum, home) => sum + (home.annual_energy_cost || 0), 0)
    const bestHome = homes.reduce((best, home) =>
      (home.current_rating < best.current_rating) ? home : best
    )
    const worstHome = homes.reduce((worst, home) =>
      (home.current_rating > worst.current_rating) ? home : worst
    )

    return { totalSavings, bestHome, worstHome }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">🏠</div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your home's energy efficiency and track improvements
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-2xl font-bold text-primary">{profile.credits || 0}</p>
            </div>
          </div>
        </div>

        {homes.length === 0 ? (
          // First-time user onboarding
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-6xl">🏠</div>
              <h2 className="text-2xl font-bold">Get started with your first home scan</h2>
              <p className="text-muted-foreground">
                Enter your postcode below to get your home's energy score in 30 seconds
              </p>

              {/* How it works steps */}
              <div className="text-left bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-primary">How it works</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">Enter your address</p>
                      <p className="text-sm text-muted-foreground">We'll find your property details</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">Get your energy score</p>
                      <p className="text-sm text-muted-foreground">See your current rating and potential savings</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">Save to your dashboard</p>
                      <p className="text-sm text-muted-foreground">Track improvements and get recommendations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address input */}
              <div className="space-y-3">
                <GooglePlacesAutocomplete
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
                  onPlaceSelect={setSelectedPlace}
                  placeholder="Enter your UK address"
                  className="text-center text-lg"
                />
                <Button
                  onClick={handleScanHome}
                  disabled={scanning || !selectedPlace}
                  className="w-full h-12 text-lg"
                >
                  {scanning ? 'Scanning...' : 'Scan Your Home'}
                </Button>
              </div>

              {/* Referral stats */}
              {profile.referral_code && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">Referrals</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share your referral code to earn credits: <code className="bg-muted px-1 rounded">{profile.referral_code}</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Returning user dashboard
          <>
            {/* Quick stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Total Annual Savings Potential
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">£{stats.totalSavings.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Home className="h-4 w-4 mr-2 text-green-500" />
                      Best Rated Home
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: ratingColor(stats.bestHome.current_rating) }}
                      >
                        {stats.bestHome.current_rating}
                      </div>
                      <span className="text-sm truncate">{stats.bestHome.address}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                      Home Needing Most Work
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: ratingColor(stats.worstHome.current_rating) }}
                      >
                        {stats.worstHome.current_rating}
                      </div>
                      <span className="text-sm truncate">{stats.worstHome.address}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Add new home button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Homes</h2>
              <Link href="/?scan=true">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Home
                </Button>
              </Link>
            </div>

            {/* Homes grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homes.map((home) => (
                <Link key={home.id} href={`/dashboard/home/${home.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                            {home.address}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {home.postcode}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: ratingColor(home.current_rating) }}
                          >
                            {home.current_rating}
                          </div>
                          {home.potential_rating && home.potential_rating !== home.current_rating && (
                            <Badge variant="secondary" className="text-xs">
                              → {home.potential_rating}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last scanned</span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(home.last_scanned_at).toLocaleDateString()}
                        </span>
                      </div>

                      {home.annual_energy_cost && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Annual cost</span>
                          <span className="font-medium">£{home.annual_energy_cost.toLocaleString()}</span>
                        </div>
                      )}

                      {home.solar_potential_kwh && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Solar potential</span>
                          <span className="font-medium text-primary">{home.solar_potential_kwh.toLocaleString()} kWh</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Recommended improvements</p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Rescan
                          </Button>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}