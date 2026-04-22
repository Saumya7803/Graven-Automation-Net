export const DEFAULT_SUPABASE_PROJECT_ID = "ubvbvmxlwffzwrtuuxrt";
export const DEFAULT_SUPABASE_URL = `https://${DEFAULT_SUPABASE_PROJECT_ID}.supabase.co`;

// Supabase publishable keys are intentionally public browser credentials.
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidmJ2bXhsd2ZmendydHV1eHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MTM3NDksImV4cCI6MjA3NzM4OTc0OX0.aoAukrOCr7kAYk2huyW_slDcSt_k0Ex9z2gy5zbPHlk";

const getEnvValue = (value: string | undefined, fallback: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue || fallback;
};

export const SUPABASE_PROJECT_ID = getEnvValue(
  import.meta.env.VITE_SUPABASE_PROJECT_ID,
  DEFAULT_SUPABASE_PROJECT_ID
);
export const SUPABASE_URL = getEnvValue(import.meta.env.VITE_SUPABASE_URL, DEFAULT_SUPABASE_URL);
export const SUPABASE_PUBLISHABLE_KEY = getEnvValue(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  DEFAULT_SUPABASE_PUBLISHABLE_KEY
);
