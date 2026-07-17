import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kenbkphrutpoxuplyddv.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlbmJrcGhydXRwb3h1cGx5ZGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjQ5NDAsImV4cCI6MjA5OTYwMDk0MH0.72GTQm2M2Id4EKBdoq8YPh7rQprqSoOWse-apjY4nm0'
  );
}
