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
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [epcResults, setEpcResults] = useState<EPCAddress[]>([]);
  const [matchedEPC, setMatchedEPC] = useState<EPCAddress | null | 'multiple'>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const handlePlaceSelect = async (place: any) => {
    setError("");
    setSelectedPlace(place);
    setAddress(place.formatted_address || "");
    const components = place.address_components || [];
    const postcodeComp = components.find((comp: any) => comp.types.includes("postal_code"));
    const newPostcode = postcodeComp ? postcodeComp.long_name : "";
    setPostcode(newPostcode);
    setLat(place.geometry?.location?.lat() || null);
    setLng(place.geometry?.location?.lng() || null);

    if (!newPostcode) {
      setError("Unable to extract postcode from address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/epc?postcode=${encodeURIComponent(newPostcode)}`);
      if (!res.ok) throw new Error("Failed to fetch EPC data");
      const data = await res.json();
      const results = (data.addresses || []).map((a: any) => ({
        address: a.address,
        'lmk-key': a.lmk,
        'current-energy-rating': '',
        'property-type': '',
      }));
      setEpcResults(results);

      // Extract street number and name
      const streetNumber = components.find((comp: any) => comp.types.includes("street_number"))?.long_name || "";
      const streetName = components.find((comp: any) => comp.types.includes("route"))?.long_name || "";
      const searchString = `${streetNumber} ${streetName}`.trim().toLowerCase();

      // Fuzzy match
      const matches = results.filter((epc: EPCAddress) => {
        const normalizedEPC = epc.address.toLowerCase().replace(/,/g, "").trim();
        return normalizedEPC.includes(searchString);
      });

      if (matches.length === 1) {
        setMatchedEPC(matches[0]);
      } else if (matches.length > 1) {
        setMatchedEPC('multiple');
      } else {
        setMatchedEPC(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch EPC data");
      setMatchedEPC(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMultiple = (epc: EPCAddress) => {
    setMatchedEPC(epc);
  };

  const handleNoMatch = () => {
    setMatchedEPC(null);
  };

  const handleClaim = async () => {
    if (!address || !postcode) {
      setError("Address or postcode missing");
      return;
    }

    setError("");
    setClaiming(true);

    try {
      const epcData = matchedEPC && matchedEPC !== 'multiple' ? matchedEPC : null;
      const res = await fetch("/api/homes/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          postcode,
          lat,
          lng,
          epcData
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to claim home");
      }

      const home = await res.json();
      setScore(home.score);
      setStep(2);

      setTimeout(() => {
        router.push(`/home/${home.id}`);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setClaiming(false);
    }
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-20 bg-background">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {step === 1 && !selectedPlace && `Welcome, ${firstName}! 🏠`}
            {step === 1 && selectedPlace && "Confirm your home"}
            {step === 2 && "You're now its guardian"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {step === 1 && !selectedPlace && "Your home's energy story starts here. Enter your address to begin."}
            {step === 1 && selectedPlace && "Let's verify the details and claim your home."}
            {step === 2 && "Your home's evolution begins today"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className={`h-2 w-40 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-40 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        </div>

        {/* Step 1: Address input and confirmation */}
        {step === 1 && (
          <Card className="p-8 bg-background">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your home address
                </label>
                <GooglePlacesAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  apiKey={apiKey}
                  placeholder="Type your home address..."
                  className="h-16 text-xl"
                  country="gb"
                />
              </div>

              {loading && <p className="text-muted-foreground">Checking for EPC data...</p>}

              {error && <p className="text-sm text-red-500">{error}</p>}

              {selectedPlace && matchedEPC === 'multiple' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    We found a few possible matches for {address}. Please select one:
                  </p>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {epcResults.filter((epc) => {
                      // Re-filter for display, but since we have them, show all? No, show only matches.
                      const components = selectedPlace.address_components || [];
                      const streetNumber = components.find((comp: any) => comp.types.includes("street_number"))?.long_name || "";
                      const streetName = components.find((comp: any) => comp.types.includes("route"))?.long_name || "";
                      const searchString = `${streetNumber} ${streetName}`.trim().toLowerCase();
                      const normalizedEPC = epc.address.toLowerCase().replace(/,/g, "").trim();
                      return normalizedEPC.includes(searchString);
                    }).map((addr, i) => (
                      <Card
                        key={i}
                        className={`p-4 cursor-pointer hover:border-primary transition-colors`}
                        onClick={() => handleSelectMultiple(addr)}
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
                  <Button variant="link" onClick={handleNoMatch}>
                    None of these? Claim without EPC
                  </Button>
                </div>
              )}

              {selectedPlace && matchedEPC && matchedEPC !== 'multiple' && (
                <div className="space-y-4">
                  <p className="text-lg font-medium">We found your EPC!</p>
                  <p className="text-muted-foreground">{address}</p>
                  <Badge variant="outline">EPC {matchedEPC['current-energy-rating']}</Badge>
                  <Button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="w-full h-12 text-lg"
                  >
                    {claiming ? "Claiming..." : "Claim My Home →"}
                  </Button>
                </div>
              )}

              {selectedPlace && matchedEPC === null && (
                <div className="space-y-4">
                  <p className="text-lg font-medium">No EPC on file — no problem!</p>
                  <p className="text-muted-foreground">We'll start fresh for {address}</p>
                  <Button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="w-full h-12 text-lg"
                  >
                    {claiming ? "Claiming..." : "Claim My Home →"}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Success */}
        {step === 2 && score !== null && (
          <Card className="p-8 text-center bg-background">
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
