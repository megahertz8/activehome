"use client";

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Share2, TrendingUp, Calendar, Zap, Sun, Thermometer, Home, MapPin } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ShareDialog from '@/components/ShareDialog'

interface SavedHome {
  id: string
  address: string
  postcode: string
  current_rating: string
  potential_rating: string
  current_efficiency: number
  potential_efficiency: number
  annual_energy_cost: number
  solar_potential_kwh: number
  last_scanned_at: string
  scan_count: number
  score_data: any
}

function ratingColor(rating: string): string {
  const colors: Record<string, string> = {
    A: "#00c781", B: "#19b459", C: "#8dce46",
    D: "#ffd500", E: "#fcaa65", F: "#ef8023", G: "#e9153b",
  };
  return colors[rating?.toUpperCase()] || "#8b949e";
}

export default function HomeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [home, setHome] = useState<SavedHome | null>(null)
  const [loading, setLoading] = useState(true)
  const [rescanning, setRescanning] = useState(false)

  useEffect(() => {
    if (id) {
      fetchHome()
    }
  }, [id])

  const fetchHome = async () => {
    try {
      const response = await fetch(`/api/homes/${id}`)
      if (response.ok) {
        const data = await response.json()
        setHome(data)
      } else if (response.status === 404) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch home:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRescan = async () => {
    if (!home) return

    setRescanning(true)
    try {
      const response = await fetch(`/api/homes/${home.id}/rescan`, {
        method: 'POST'
      })

      if (response.ok) {
        const updatedHome = await response.json()
        setHome(updatedHome)
        // Could show a success toast here
      } else {
        console.error('Failed to rescan home')
      }
    } catch (error) {
      console.error('Error rescanning:', error)
    } finally {
      setRescanning(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">🏠</div>
            <p className="text-muted-foreground">Loading home details...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!home) {
    return (
      <ProtectedRoute>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Home not found</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  const scoreData = home.score_data

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold truncate">{home.address}</h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {home.postcode}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleRescan}
              disabled={rescanning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${rescanning ? 'animate-spin' : ''}`} />
              {rescanning ? 'Rescanning...' : 'Rescan for Latest Data'}
            </Button>
            <ShareDialog
              data={{
                address: home.address,
                currentRating: home.current_rating,
                potentialRating: home.potential_rating || '',
                livePricing: scoreData?.livePricing ? { liveSavings: scoreData.livePricing.liveSavings } : undefined,
                annualSavings: scoreData?.annualSavings || 0,
                solar: scoreData?.solar ? { annualGeneration_kWh: scoreData.solar.annualGeneration_kWh } : undefined
              }}
              ogImageUrl={`/api/og?address=${encodeURIComponent(home.address)}&score=${home.current_rating}&rating_label=${home.potential_rating || home.current_rating}`}
            />
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                  style={{ backgroundColor: ratingColor(home.current_rating) }}
                >
                  {home.current_rating}
                </div>
                <div>
                  <p className="text-2xl font-bold">{home.current_efficiency}/100</p>
                  <p className="text-xs text-muted-foreground">Efficiency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Potential Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                  style={{ backgroundColor: ratingColor(home.potential_rating || home.current_rating) }}
                >
                  {home.potential_rating || home.current_rating}
                </div>
                <div>
                  <p className="text-2xl font-bold">{home.potential_efficiency || home.current_efficiency}/100</p>
                  <p className="text-xs text-muted-foreground">Efficiency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                Annual Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">£{home.annual_energy_cost?.toLocaleString() || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Current energy bills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Sun className="h-4 w-4 mr-1" />
                Solar Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {home.solar_potential_kwh?.toLocaleString() || 0} kWh
              </p>
              <p className="text-xs text-muted-foreground">Annual generation</p>
            </CardContent>
          </Card>
        </div>

        {/* Score history */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Score History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: ratingColor(home.current_rating) }}
                  >
                    {home.current_rating}
                  </div>
                  <div>
                    <p className="font-medium">Current assessment</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(home.last_scanned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  Scan #{home.scan_count}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full score details - reuse ScoreResults structure */}
        {scoreData && (
          <>
            {/* Energy cost breakdown */}
            {scoreData.livePricing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Energy Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-red-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-red-400">£{scoreData.livePricing.currentAnnualCost}/yr</p>
                      <p className="text-sm text-muted-foreground">Current costs</p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">£{scoreData.livePricing.potentialAnnualCost}/yr</p>
                      <p className="text-sm text-muted-foreground">After improvements</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-success/10 rounded-lg mt-4">
                    <p className="text-lg text-muted-foreground">Annual savings</p>
                    <p className="text-3xl font-bold text-success">£{scoreData.livePricing.liveSavings}/year</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Heat loss visualization */}
            {scoreData.energyCalc?.heatLoss && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Thermometer className="h-5 w-5 mr-2" />
                    Heat Loss Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Walls', value: scoreData.energyCalc.heatLoss.walls, color: 'bg-red-500' },
                      { label: 'Roof', value: scoreData.energyCalc.heatLoss.roof, color: 'bg-orange-500' },
                      { label: 'Floor', value: scoreData.energyCalc.heatLoss.floor, color: 'bg-yellow-500' },
                      { label: 'Windows', value: scoreData.energyCalc.heatLoss.windows, color: 'bg-blue-500' },
                      { label: 'Ventilation', value: scoreData.energyCalc.heatLoss.ventilation, color: 'bg-purple-500' }
                    ].sort((a, b) => b.value - a.value).map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${(item.value / scoreData.energyCalc.heatLoss.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-mono w-12 text-right">{item.value} W/K</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Focus on improving your {[
                      { label: 'walls', value: scoreData.energyCalc.heatLoss.walls },
                      { label: 'roof', value: scoreData.energyCalc.heatLoss.roof },
                      { label: 'floor', value: scoreData.energyCalc.heatLoss.floor },
                      { label: 'windows', value: scoreData.energyCalc.heatLoss.windows },
                      { label: 'ventilation', value: scoreData.energyCalc.heatLoss.ventilation }
                    ].sort((a, b) => b.value - a.value)[0].label} for maximum savings
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Solar potential */}
            {scoreData.solar && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sun className="h-5 w-5 mr-2" />
                    Solar Potential
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-2xl font-bold">Your roof could generate</p>
                    <p className="text-4xl font-bold text-primary">{scoreData.solar.annualGeneration_kWh.toLocaleString()} kWh/year</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold">{scoreData.solar.roofCapacity_kWp} kWp</p>
                      <p className="text-xs text-muted-foreground">System size</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary">£{scoreData.solar.annualSavings_GBP}/yr</p>
                      <p className="text-xs text-muted-foreground">Annual savings</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Payback period</p>
                    <p className="text-xl font-bold">{scoreData.solar.paybackYears} years</p>
                    <p className="text-xs text-muted-foreground">CO₂ saved: {scoreData.solar.co2Saved_kg.toLocaleString()} kg/year</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{scoreData.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Floor Area</span>
                    <span>{scoreData.floorArea} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Walls</span>
                    <span>{scoreData.walls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Roof</span>
                    <span>{scoreData.roof}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Windows</span>
                    <span>{scoreData.windows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Heating</span>
                    <span>{scoreData.heating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Improvement recommendations */}
            {scoreData.grants && scoreData.grants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Grants & Incentives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scoreData.grants.map((grant: any, i: number) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{grant.scheme}</span>
                        <Badge className="bg-primary/20 text-primary">{grant.amount}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{grant.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Back button */}
        <div className="pt-8">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  )
}