"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
    <main className="flex flex-col items-center min-h-screen px-4 pt-8 pb-16">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="text-primary text-xl font-bold mb-4 block">
          <span className="text-primary">Evolving</span> Home
        </Link>
        <p className="text-sm text-muted-foreground">{data.address}</p>
      </div>

      {/* Score Circle */}
      <div className="mb-8 text-center">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold border-4 mx-auto"
          style={{ borderColor: ratingColor(data.currentRating), color: ratingColor(data.currentRating) }}
        >
          {data.currentRating}
        </div>
        <p className="text-muted-foreground mt-2">
          EPC Rating · {data.currentEfficiency}/100
        </p>
        <p className="text-sm text-muted-foreground">
          Could be <span className="font-semibold" style={{ color: ratingColor(data.potentialRating) }}>{data.potentialRating}</span> with improvements
        </p>
      </div>

      {/* Savings Hook */}
      <Card className="bg-card border-border w-full max-w-lg mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">💰 Your home is costing you extra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-destructive">£{data.currentCost}/yr</p>
              <p className="text-xs text-muted-foreground">Current energy costs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">£{data.potentialCost}/yr</p>
              <p className="text-xs text-muted-foreground">After improvements</p>
            </div>
          </div>
          <div className="text-center mt-4 p-3 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">You could save</p>
            <p className="text-3xl font-bold text-primary">£{data.annualSavings}/year</p>
            <p className="text-xs text-muted-foreground">
              That&apos;s <span className="text-primary font-semibold">£{data.twentyYearSavings.toLocaleString()}</span> over 20 years
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card className="bg-card border-border w-full max-w-lg mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">🏠 Your Home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{data.propertyType}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Floor Area</span><span>{data.floorArea} m²</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Walls</span><span>{data.walls}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Roof</span><span>{data.roof}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Windows</span><span>{data.windows}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Heating</span><span>{data.heating}</span></div>
        </CardContent>
      </Card>

      {/* Grants */}
      {data.grants.length > 0 && (
        <Card className="bg-card border-border w-full max-w-lg mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">🎁 Available Grants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.grants.map((g, i) => (
              <div key={i} className="p-3 rounded-lg bg-secondary">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">{g.scheme}</span>
                  <Badge className="bg-success/20 text-success">{g.amount}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{g.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CTAs */}
      <div className="w-full max-w-lg space-y-3">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg font-semibold">
          🔧 Get 3 Quotes from Local Contractors
        </Button>
        <Button variant="outline" className="w-full h-12">
          📤 Share My Score
        </Button>
        <Link href="/" className="block">
          <Button variant="ghost" className="w-full">← Check another home</Button>
        </Link>
      </div>
    </main>
  );
}
