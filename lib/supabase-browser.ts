import { createClient } from '@supabase/supabase-js';

// Browser-safe client — anon key only, no service role key
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
