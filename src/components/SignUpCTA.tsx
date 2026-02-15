"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";
import { detectCountry } from "@/lib/adapters";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";

export default function SignUpCTA() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [homes, setHomes] = useState<any[]>([]);
  const [homesLoading, setHomesLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Fetch user's homes if logged in
  useEffect(() => {
    if (user) {
      fetch("/api/homes")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setHomes(data);
          }
          setHomesLoading(false);
        })
        .catch(() => setHomesLoading(false));
    } else {
      setHomesLoading(false);
    }
  }, [user]);

  const handlePlaceSelect = (place: any) => {
  setAddress(place.formatted_address || "");
  const postcodeComp = place.address_components?.find((comp: any) => comp.types?.includes("postal_code"));
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

    if (!address.trim() || !postcode.trim() || (!!apiKey && lat === null)) {
      setError(!!apiKey ? "Please select your address from the suggestions and enter your postcode" : "Please enter both address and postcode");
      return;
    }

    setSaving(true);

    try {
      // Detect country from postcode
      const country = detectCountry(postcode);

      // First, get the score data
      const scoreResponse = await fetch(
        `/api/epc/score?postcode=${encodeURIComponent(postcode)}&country=${country}`
      );

      if (!scoreResponse.ok) {
        throw new Error("Could not fetch home data. Please check your postcode.");
      }

      const scoreData = await scoreResponse.json();

      // Save to homes
      const saveResponse = await fetch("/api/homes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode: postcode.trim(),
          address: address.trim(),
          lat,
          lng,
          lmk_key: scoreData.lmk_key,
          current_rating: scoreData.current_energy_rating,
          potential_rating: scoreData.potential_energy_rating,
          current_efficiency: scoreData.current_energy_efficiency,
          potential_efficiency: scoreData.potential_energy_efficiency,
          annual_energy_cost: scoreData.annual_energy_cost,
          solar_potential_kwh: scoreData.solar_potential_kwh,
          score_data: scoreData,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || "Failed to save home");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  if (loading || homesLoading) {
    return (
      <div className="w-full max-w-md mb-16">
        <div className="text-center">
          <div className="text-2xl mb-2 animate-pulse">🏠</div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show signup button
  if (!user) {
    return (
      <div className="w-full max-w-md mb-16 text-center">
        <Button
          onClick={() => router.push("/auth/login")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg font-semibold w-full"
        >
          Sign Up to Evolving Home →
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          🔒 Your address is saved securely in your account
        </p>
      </div>
    );
  }

  // Logged in with home - show view dashboard button
  if (homes.length > 0) {
    return (
      <div className="w-full max-w-md mb-16 text-center">
        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg font-semibold w-full"
        >
          View My Home →
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          You have {homes.length} home{homes.length > 1 ? "s" : ""} saved
        </p>
      </div>
    );
  }

  // Logged in but no home - show address input
  return (
    <form onSubmit={handleSaveHome} className="w-full max-w-md mb-16">
      <div className="space-y-3">
        {!!apiKey ? (
          <GooglePlacesAutocomplete
            onPlaceSelect={handlePlaceSelect}
            apiKey={apiKey}
            placeholder="Search and select your address"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-lg"
          />
        ) : (
          <Input
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-lg"
            disabled={saving}
          />
        )}
        <Input
          type="text"
          placeholder="Enter your postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-lg"
          disabled={saving}
        />
        <Button
          type="submit"
          disabled={saving || !address.trim() || !postcode.trim() || (!!apiKey && lat === null)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 text-lg font-semibold w-full"
        >
          {saving ? "Saving..." : "Save My Home"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
      )}

      <p className="text-xs text-muted-foreground mt-3 text-center">
        🔒 Your address is saved securely in your account
      </p>
    </form>
  );
}
