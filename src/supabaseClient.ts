import { createClient } from '@supabase/supabase-js';

// Pastikan case-sensitive: VITE_SUPABASE_URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Log ini akan muncul di Console Browser (F12) untuk verifikasi
console.log("Mengecek URL:", supabaseUrl); 

if (!supabaseUrl || !supabaseKey) {
  // Memberikan pesan error yang lebih spesifik jika .env tidak terbaca
  throw new Error("Supabase URL atau Key tidak ditemukan di .env. Pastikan sudah pakai prefix VITE_ dan sudah restart terminal.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);