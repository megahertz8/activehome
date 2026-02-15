"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Home, MapPin } from "lucide-react";

interface EPCAddress {
  address: string;
  'lmk-key': string;
  'current-energy-rating': string;
  'property-type': string;
}

function OnboardingContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState<EPCAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedEPC, setSelectedEPC] = useState<any>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const handleFindAddresses = async () => {
    if (!postcode.trim()) {
      setError("Please enter a postcode");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/epc?postcode=${encodeURIComponent(postcode)}`);
      if (!res.ok) throw new Error("Failed to fetch addresses");
      
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        setAddresses(data.results.slice(0, 20)); // Show top 20
        setStep(2);
      } else {
        setError("No addresses found for this postcode. You can enter manually below.");
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || "Failed to find addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address: EPCAddress) => {
    setSelectedAddress(address.address);
    setSelectedEPC(address);
  };

  const handlePlaceSelect = (place: any) => {
    setManualAddress(place.formatted_address || "");
    const postcodeComp = place.address_components?.find(
      (comp: any) => comp.types?.includes("postal_code")
    );
    if (postcodeComp?.long_name) {
      setPostcode(postcodeComp.long_name);
    }
    if (place.geometry?.location) {
      setLat(place.geometry.location.lat());
      setLng(place.geometry.location.lng());
    }
  };

  const handleContinue = async () => {
    const finalAddress = selectedAddress || manualAddress;

    if (!finalAddress || !postcode) {
      setError("Please select or enter your address");
      return;
    }

    setError("");
    setClaiming(true);

    try {
      // Claim the home
      const res = await fetch("/api/homes/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: finalAddress,
          postcode,
          lat,
          lng,
          epcData: selectedEPC
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to claim home");
      }

      const home = await res.json();
      setScore(home.score);
      setStep(3);

      // After showing success, redirect to home page
      setTimeout(() => {
        router.push(`/home/${home.id}`);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setClaiming(false);
    }
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {step === 1 && `Welcome, ${firstName}! 🏠`}
            {step === 2 && "Let's find your home"}
            {step === 3 && "You're now its guardian"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {step === 1 && "Let's claim your home and start its energy story"}
            {step === 2 && "Select your address or enter it manually"}
            {step === 3 && "Your home's evolution begins today"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className={`h-2 w-20 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-20 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-20 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
        </div>

        {/* Step 1: Postcode input */}
        {step === 1 && (
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Enter your postcode
                </label>
                <Input
                  type="text"
                  placeholder="e.g. SW1A 1AA"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleFindAddresses()}
                  className="h-12 text-lg"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                onClick={handleFindAddresses}
                disabled={loading || !postcode.trim()}
                className="w-full h-12 text-lg"
              >
                {loading ? "Searching..." : "Find My Home →"}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Address selection */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Address list */}
            {addresses.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Found {addresses.length} addresses at {postcode}
                </p>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {addresses.map((addr, i) => (
                    <Card
                      key={i}
                      className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                        selectedAddress === addr.address ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => handleSelectAddress(addr)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{addr.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr['property-type']}
                          </p>
                        </div>
                        <Badge variant="outline">
                          EPC {addr['current-energy-rating']}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Manual entry fallback */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or enter manually
                </span>
              </div>
            </div>

            <div>
              {apiKey ? (
                <GooglePlacesAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  apiKey={apiKey}
                  placeholder="Start typing your address..."
                  className="h-12 text-lg"
                />
              ) : (
                <Input
                  type="text"
                  placeholder="Enter your full address"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="h-12 text-lg"
                />
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                ← Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={claiming || (!selectedAddress && !manualAddress)}
                className="flex-1"
              >
                {claiming ? "Claiming..." : "Continue →"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && score !== null && (
          <Card className="p-8 text-center">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
                <Home className="w-10 h-10 text-primary" />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">Your home scores</h2>
                <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                  {score}/100
                </div>
              </div>

              <p className="text-muted-foreground max-w-md mx-auto">
                This is your home's story so far. Every improvement you make writes the next chapter.
              </p>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting to your home page...
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
