"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";

export default function PostcodeForm() {
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace?.geometry?.location) return;

    setLoading(true);

    // Extract postcode from address components
    const postcode = selectedPlace.address_components?.find(
      component => component.types.includes('postal_code')
    )?.long_name || '';

    if (!postcode) {
      alert('Could not extract postcode from selected address. Please try again.');
      setLoading(false);
      return;
    }

    // Get lat/lng for geocoding
    const lat = selectedPlace.geometry.location.lat();
    const lng = selectedPlace.geometry.location.lng();

    // Redirect with postcode and address
    const address = selectedPlace.formatted_address || '';
    window.location.href = `/score?postcode=${encodeURIComponent(postcode)}&address=${encodeURIComponent(address)}&lat=${lat}&lng=${lng}`;
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md mb-16">
      <div className="flex gap-2">
        <GooglePlacesAutocomplete
          apiKey={apiKey}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Enter your UK address"
          className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 text-lg"
        />
        <Button
          type="submit"
          disabled={loading || !selectedPlace}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 text-lg font-semibold"
        >
          {loading ? "..." : "Score"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        🔒 We don&apos;t store your address. Data comes from public UK EPC records.
      </p>
    </form>
  );
}
