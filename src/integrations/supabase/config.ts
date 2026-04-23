export const DEFAULT_SUPABASE_PROJECT_ID = "izphkdvrexejctdabplp";
export const DEFAULT_SUPABASE_URL = `https://${DEFAULT_SUPABASE_PROJECT_ID}.supabase.co`;

// Supabase publishable keys are intentionally public browser credentials.
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cGhrZHZyZXhlamN0ZGFicGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjQ0MjIsImV4cCI6MjA4NDg0MDQyMn0.jMqJaivin7DqkYSrj0KM0IagkrIDK1ZhLcCqMIMOe60";

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
