"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function detectCountry(postcode: string): string {
  const cleaned = postcode.trim().replace(/\s+/g, "");
  if (/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/i.test(cleaned)) return "GB";
  if (/^\d{5}$/.test(cleaned)) return "FR";
  if (/^\d{4}[A-Z]{2}$/i.test(cleaned)) return "NL";
  if (/^\d{4}$/.test(cleaned) && parseInt(cleaned) >= 200) return "AU";
  return "GB";
}

function OnboardingContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const handlePlaceSelect = (place: any) => {
    setAddress(place.formatted_address || "");
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

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!address.trim() || !postcode.trim()) {
      setError("Please enter your address and postcode");
      return;
    }

    setSaving(true);

    try {
      const country = detectCountry(postcode);

      const saveResponse = await fetch("/api/homes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode: postcode.trim(),
          address: address.trim(),
          lat,
          lng,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || "Failed to save home");
      }

      // Success! Go to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSaving(false);
    }
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-lg w-full">
        {/* Welcome header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Welcome, {firstName}! 🏠
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's set up your home to get your energy score.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-2 w-16 rounded-full bg-primary" />
          <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-16 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
        </div>

        {/* Address form */}
        <form onSubmit={handleSaveHome} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Your home address
            </label>
            {apiKey ? (
              <GooglePlacesAutocomplete
                onPlaceSelect={handlePlaceSelect}
                apiKey={apiKey}
                placeholder="Start typing your address..."
                className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-lg"
              />
            ) : (
              <Input
                type="text"
                placeholder="Enter your full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-lg"
                disabled={saving}
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Postcode
            </label>
            <Input
              type="text"
              placeholder="e.g. SW1A 1AA"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-lg"
              disabled={saving}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={saving || !address.trim() || !postcode.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-semibold w-full"
          >
            {saving ? "Setting up your home..." : "Get My Energy Score →"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          🔒 Your address is saved securely. We use it to find your home's energy data.
        </p>
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
