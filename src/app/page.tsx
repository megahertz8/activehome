"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;
    setLoading(true);
    // TODO: Navigate to /score?postcode=XX
    window.location.href = `/score?postcode=${encodeURIComponent(postcode.trim().toUpperCase())}`;
  };

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
      <form onSubmit={handleSearch} className="w-full max-w-md mb-16">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter your UK postcode (e.g. SW1A 1AA)"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-lg"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 text-lg font-semibold"
          >
            {loading ? "..." : "Score"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          🔒 We don&apos;t store your address. Data comes from public UK EPC records.
        </p>
      </form>

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
