"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface BuildingGeometry {
  footprintArea_m2: number;
  perimeter_m: number;
  orientation_deg: number;
  orientationLabel: string;
  longestWallLength_m: number;
  longestWallBearing_deg: number;
  levels: number | null;
  height_m: number | null;
  material: string | null;
  roofShape: string | null;
  buildingType: string | null;
  yearBuilt: number | null;
  estimatedWallArea_m2: number;
  estimatedRoofArea_m2: number;
  sharedWalls: { length_m: number; bearing_deg: number }[];
  exposedPerimeter_m: number;
}

interface EPCData {
  address: string;
  postcode: string;
  currentRating: string;
  potentialRating: string;
  currentEfficiency: number;
  propertyType: string;
  floorArea: string;
  annualSavings: number;
  twentyYearSavings: number;
  currentCost: number;
  potentialCost: number;
  walls: string;
  roof: string;
  windows: string;
  heating: string;
  grants: { scheme: string; amount: string; description: string }[];
  energyCalc?: {
    heatLoss: {
      walls: number;
      roof: number;
      floor: number;
      windows: number;
      ventilation: number;
      total: number;
    };
    heatingDemand_kWh: number;
    hotWaterDemand_kWh: number;
    totalDemand_kWh: number;
  };
  livePricing?: {
    region: string;
    electricityRate_p: number;
    gasRate_p: number;
    currentAnnualCost: number;
    potentialAnnualCost: number;
    liveSavings: number;
  };
  solar?: {
    roofCapacity_kWp: number;
    annualGeneration_kWh: number;
    annualSavings_GBP: number;
    paybackYears: number;
    co2Saved_kg: number;
  };
  buildingGeometry?: BuildingGeometry | null;
  enrichedScore?: any; // For future use
}

function ratingColor(rating: string): string {
  const colors: Record<string, string> = {
    A: "#00c781", B: "#19b459", C: "#8dce46",
    D: "#ffd500", E: "#fcaa65", F: "#ef8023", G: "#e9153b",
  };
  return colors[rating?.toUpperCase()] || "#8b949e";
}

export default function ScoreResults() {
  const searchParams = useSearchParams();
  const postcode = searchParams.get("postcode") || "";
  const address = searchParams.get("address") || "";
  const [data, setData] = useState<EPCData | null>(null);
  const [addresses, setAddresses] = useState<{ address: string; lmk: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [integrationsLoading, setIntegrationsLoading] = useState(false);

  useEffect(() => {
    if (!postcode) return;

    async function fetchEPC() {
      try {
        const res = await fetch(`/api/epc?postcode=${encodeURIComponent(postcode)}${address ? `&address=${encodeURIComponent(address)}` : ""}`);
        const json = await res.json();

        if (json.addresses) {
          setAddresses(json.addresses);
          setLoading(false);
          return;
        }

        if (json.error) {
          setError(json.error);
          setLoading(false);
          return;
        }

        setData(json);
        setLoading(false);
      } catch {
        setError("Failed to fetch energy data. Please try again.");
        setLoading(false);
      }
    }

    fetchEPC();
  }, [postcode, address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏠</div>
          <p className="text-muted-foreground">Looking up your home...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-destructive mb-4">{error}</p>
        <Link href="/"><Button variant="outline">Try another postcode</Button></Link>
      </div>
    );
  }

  // Address selection step
  if (addresses.length > 0 && !data) {
    return (
      <main className="flex flex-col items-center min-h-screen px-4 pt-16">
        <h1 className="text-2xl font-bold mb-2">Select your address</h1>
        <p className="text-muted-foreground mb-6">{postcode}</p>
        <div className="w-full max-w-lg space-y-2">
          {addresses.map((a) => (
            <Link
              key={a.lmk}
              href={`/score?postcode=${encodeURIComponent(postcode)}&address=${encodeURIComponent(a.address)}`}
            >
              <Card className="bg-card border-border hover:border-primary cursor-pointer transition-colors mb-2">
                <CardContent className="py-3 px-4">
                  <p className="text-sm">{a.address}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Link href="/" className="mt-6">
          <Button variant="outline" size="sm">← Different postcode</Button>
        </Link>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="flex flex-col items-center min-h-screen px-4 pt-8 pb-16 bg-[#08080d] text-white">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="text-primary text-xl font-bold mb-4 block">
          <span className="text-primary">Evolving</span> Home
        </Link>
        <p className="text-sm text-muted-foreground">{data.address}</p>
      </div>

      {/* Energy Rating Hero */}
      <div className="mb-8 text-center">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold border-4 mx-auto mb-4"
          style={{ borderColor: ratingColor(data.currentRating), color: ratingColor(data.currentRating) }}
        >
          {data.currentRating}
        </div>
        <p className="text-gray-400 mb-2">
          EPC Rating · {data.currentEfficiency}/100
        </p>
        <p className="text-sm text-gray-400">
          Could improve to <span className="font-semibold text-[#4ecdc4]">{data.potentialRating}</span> with upgrades
        </p>
      </div>

      {/* Live Cost Card */}
      {data.livePricing && (
        <Card className="bg-[#1c1c28] border-gray-700 w-full max-w-lg mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#4ecdc4]">⚡ Based on today&apos;s energy prices in {data.livePricing.region}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div>
                <p className="text-2xl font-bold text-red-400">£{data.livePricing.currentAnnualCost}/yr</p>
                <p className="text-xs text-gray-400">Current energy costs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#4ecdc4]">£{data.livePricing.potentialAnnualCost}/yr</p>
                <p className="text-xs text-gray-400">After improvements</p>
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800">
              <p className="text-sm text-gray-400">Annual savings</p>
              <p className="text-3xl font-bold text-[#4ecdc4]">£{data.livePricing.liveSavings}/year</p>
              <p className="text-xs text-gray-400">Live prices • Updated daily</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heat Loss Breakdown */}
      {data.energyCalc && (
        <Card className="bg-[#1c1c28] border-gray-700 w-full max-w-lg mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#4ecdc4]">🔥 Heat Loss Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Walls', value: data.energyCalc.heatLoss.walls, color: 'bg-red-500' },
                { label: 'Roof', value: data.energyCalc.heatLoss.roof, color: 'bg-orange-500' },
                { label: 'Floor', value: data.energyCalc.heatLoss.floor, color: 'bg-yellow-500' },
                { label: 'Windows', value: data.energyCalc.heatLoss.windows, color: 'bg-blue-500' },
                { label: 'Ventilation', value: data.energyCalc.heatLoss.ventilation, color: 'bg-purple-500' }
              ].sort((a, b) => b.value - a.value).map((item, i) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.value / data.energyCalc!.heatLoss.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-mono w-12 text-right">{item.value} W/K</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Your biggest heat loss is through your <strong className="text-[#4ecdc4]">
                {[
                  { label: 'walls', value: data.energyCalc.heatLoss.walls },
                  { label: 'roof', value: data.energyCalc.heatLoss.roof },
                  { label: 'floor', value: data.energyCalc.heatLoss.floor },
                  { label: 'windows', value: data.energyCalc.heatLoss.windows },
                  { label: 'ventilation', value: data.energyCalc.heatLoss.ventilation }
                ].sort((a, b) => b.value - a.value)[0].label}
              </strong> — wall insulation would save the most
            </p>
          </CardContent>
        </Card>
      )}

      {/* Solar Potential */}
      {data.solar && (
        <Card className="bg-[#1c1c28] border-gray-700 w-full max-w-lg mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#4ecdc4]">☀️ Solar Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-2xl font-bold">Your roof could generate</p>
              <p className="text-4xl font-bold text-[#4ecdc4]">{data.solar.annualGeneration_kWh.toLocaleString()} kWh/year</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{data.solar.roofCapacity_kWp} kWp</p>
                <p className="text-xs text-gray-400">System size</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#4ecdc4]">£{data.solar.annualSavings_GBP}/yr</p>
                <p className="text-xs text-gray-400">Annual savings</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-gray-800">
              <p className="text-sm text-gray-400">Payback period</p>
              <p className="text-xl font-bold">{data.solar.paybackYears} years</p>
              <p className="text-xs text-gray-400">CO₂ saved: {data.solar.co2Saved_kg.toLocaleString()} kg/year</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Details */}
      <Card className="bg-[#1c1c28] border-gray-700 w-full max-w-lg mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-[#4ecdc4]">🏠 Your Home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Type</span><span>{data.propertyType}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Floor Area</span><span>{data.floorArea} m²</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Walls</span><span>{data.walls}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Roof</span><span>{data.roof}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Windows</span><span>{data.windows}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Heating</span><span>{data.heating}</span></div>
        </CardContent>
      </Card>

      {/* Building Intelligence */}
      {data.buildingGeometry && (
        <Card className="bg-[#1c1c28] border-gray-700 w-full max-w-lg mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#4ecdc4]">🧠 Building Intelligence {data.enrichedScore ? <span className="text-xs bg-[#4ecdc4]/20 text-[#4ecdc4] px-2 py-1 rounded ml-2">Enhanced</span> : ''}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Footprint Area</span>
              <span>{Math.round(data.buildingGeometry.footprintArea_m2)} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Orientation</span>
              <span>{data.buildingGeometry.orientationLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shared Walls</span>
              <span>{data.buildingGeometry.sharedWalls.length} detected ({data.buildingGeometry.sharedWalls.length > 0 ? 'party walls' : 'none'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Exposed Perimeter</span>
              <span>{Math.round(data.buildingGeometry.exposedPerimeter_m)} m</span>
            </div>
            {data.enrichedScore && (
              <div className="mt-3 p-2 rounded bg-[#4ecdc4]/10 border border-[#4ecdc4]/20">
                <p className="text-xs text-[#4ecdc4]">Geometry-enhanced calculations applied</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grants */}
      {data.grants.length > 0 && (
        <Card className="bg-[#1c1c28] border-gray-700 w-full max-w-lg mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#4ecdc4]">🎁 Available Grants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.grants.map((g, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">{g.scheme}</span>
                  <Badge className="bg-[#4ecdc4]/20 text-[#4ecdc4]">{g.amount}</Badge>
                </div>
                <p className="text-xs text-gray-400">{g.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CTAs */}
      <div className="w-full max-w-lg space-y-3">
        <Button className="w-full bg-[#4ecdc4] text-black hover:bg-[#4ecdc4]/90 h-12 text-lg font-semibold">
          🔧 Get 3 Quotes from Local Contractors
        </Button>
        <Button variant="outline" className="w-full h-12 border-gray-600 text-gray-300 hover:bg-gray-700">
          📤 Share My Score
        </Button>
        <Link href="/" className="block">
          <Button variant="ghost" className="w-full text-gray-400 hover:text-white">← Check another home</Button>
        </Link>
      </div>
    </main>
  );
}
