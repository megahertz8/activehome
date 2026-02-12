"use client";

import { useEffect, useRef, useState } from 'react';

interface SatelliteMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  apiKey: string;
  className?: string;
}

export default function SatelliteMap({
  lat,
  lng,
  zoom = 20,
  apiKey,
  className = ""
}: SatelliteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
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
    if (isLoaded && mapRef.current && !map) {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add a marker at the property location
      new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4ecdc4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      setMap(mapInstance);
    }
  }, [isLoaded, lat, lng, zoom, map]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-64 rounded-lg overflow-hidden ${className}`}
      style={{ backgroundColor: '#f0f0f0' }}
    />
  );
}