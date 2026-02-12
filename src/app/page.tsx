"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PostcodeForm from "@/components/PostcodeForm";

function HomeContent() {
  const searchParams = useSearchParams();
  const scan = searchParams.get("scan");
  const postcode = searchParams.get("postcode");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  useEffect(() => {
    if (scan === "true" && postcode) {
      // Redirect to score page with params
      window.location.href = `/score?postcode=${encodeURIComponent(postcode)}${lat && lng ? `&lat=${lat}&lng=${lng}` : ""}`;
    }
  }, [scan, postcode, lat, lng]);

  if (scan === "true" && postcode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏠</div>
          <p className="text-muted-foreground">Scanning your home...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="text-primary">Evolving</span> Home
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-2">
          Your home&apos;s energy score in 30 seconds
        </p>
        <p className="text-muted-foreground">
          Free. Private. No app download needed.
        </p>
      </div>

      {/* Search */}
      <PostcodeForm />

      {/* Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-lg">💰 See Your Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Find out how much you&apos;re overpaying on energy and what improvements could save you £100s per year.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-lg">🏠 Improvement Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Get a personalised plan with costs, savings, and government grants you may be eligible for.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-lg">🔧 Find Contractors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Connect with TrustMark-certified local contractors to make improvements and boost your score.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-16 mb-8 text-center text-muted-foreground text-xs">
        <p>© 2026 Evolving Home · Privacy-first · Open source energy models</p>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏠</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
