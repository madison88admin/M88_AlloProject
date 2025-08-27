import { createClient } from '@supabase/supabase-js';

// M88 Database credentials
const supabaseUrl = 'https://likhnslbtafximlzucsj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpa2huc2xidGFmeGltbHp1Y3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxODYxODAsImV4cCI6MjA3MTc2MjE4MH0._8lRDqVlaRvK3ziFu8SFQjGKHva7aSTSRZuvQyNhh2w';

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
