import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://lxtecfpylliyrjgmuvjk.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGVjZnB5bGxpeXJqZ211dmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwODk5NjMsImV4cCI6MjA5NTY2NTk2M30.SCRHx_p3S9wGduczERV59NAydSpTbnqgcV7whEgbMts';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
