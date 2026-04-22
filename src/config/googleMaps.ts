// Google Maps API configuration
// This key is safe to expose in the frontend when properly restricted in Google Cloud Console
// to your domain and specific APIs (Places API, Geocoding API, Maps JavaScript API)

export const GOOGLE_MAPS_CONFIG = {
  // Replace with your actual Google Maps API key
  // Get it from: https://console.cloud.google.com/google/maps-apis/credentials
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE",
  
  // Libraries to load
  libraries: ["places"] as const,
  
  // Default country restriction (ISO 3166-1 Alpha-2 code)
  defaultCountry: "in", // India
};
