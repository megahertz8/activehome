"use client";

import { useEffect, useRef, useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  apiKey: string;
  country?: string;
}

export default function GooglePlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Enter your address",
  className = "",
  apiKey,
  country,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadFailed(true);
      return;
    }

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
      setLoadFailed(true);
    };

    // Timeout fallback — if not loaded in 5s, unlock the input
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        setLoadFailed(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [apiKey]);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocomplete) {
      try {
        const options: google.maps.places.AutocompleteOptions = {
          types: ['address'],
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
        };

        if (country) {
          options.componentRestrictions = { country };
        }

        const ac = new google.maps.places.Autocomplete(inputRef.current, options);

        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (place.geometry?.location) {
            onPlaceSelect(place);
          }
        });

        setAutocomplete(ac);
      } catch (err) {
        console.error('Failed to init autocomplete:', err);
        setLoadFailed(true);
      }
    }
  }, [isLoaded, autocomplete, onPlaceSelect, country]);

  // Never disable the input — allow typing even if Google hasn't loaded
  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder={loadFailed ? placeholder : (isLoaded ? placeholder : "Loading address search...")}
      className={className}
    />
  );
}
