"use client";

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  apiKey: string;
}

export default function GooglePlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Enter your address",
  className = "",
  apiKey
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };
  }, [apiKey]);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocomplete) {
      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'gb' }, // Restrict to UK
        fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
      });

      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place.geometry?.location) {
          onPlaceSelect(place);
        }
      });

      setAutocomplete(ac);
    }
  }, [isLoaded, autocomplete, onPlaceSelect]);

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className={className}
      disabled={!isLoaded}
    />
  );
}