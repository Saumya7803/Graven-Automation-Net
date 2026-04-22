import { useState, useEffect } from 'react';
import { GOOGLE_MAPS_CONFIG } from '@/config/googleMaps';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    // Validate API key
    if (!GOOGLE_MAPS_CONFIG.apiKey || GOOGLE_MAPS_CONFIG.apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
      setError(new Error('Google Maps API key not configured'));
      return;
    }

    // Create callback function
    window.initGoogleMaps = () => {
      setIsLoaded(true);
      delete window.initGoogleMaps;
    };

    // Load script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(',')}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      setError(new Error('Failed to load Google Maps script'));
      delete window.initGoogleMaps;
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup callback if component unmounts before load
      delete window.initGoogleMaps;
    };
  }, []);

  return { isLoaded, error };
};
