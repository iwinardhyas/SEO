import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsuosleeibczokipkbwh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW9zbGVlaWJjem9raXBrYndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjA1NzcsImV4cCI6MjA5MzAzNjU3N30.ouHVIdnR4gNdZ7mDcs2b63nBxr00uM9-Ffc7YlyW-BQ';

export const supabase = createClient(supabaseUrl, supabaseKey);