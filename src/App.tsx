import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Search, Loader2, LogOut, Database } from 'lucide-react';
// Import tipe Session dari Supabase
import type { Session } from '@supabase/supabase-js';

export default function App() {
  // 1. Tambahkan tipe data pada state
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // 2. Tambahkan tipe React.FormEvent pada event handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  // 3. Gabungkan logika handleCrawl menjadi satu blok yang rapi
  const handleCrawl = async () => {
    if (!keyword) return alert("Input Keywords");
    
    setLoading(true);
    try {
      // Memanggil API Backend Python di Vercel
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword }),
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setResults(result.data); // Update tabel dengan data baru
        alert("finish! Data to Supabase & GSheet.");
      } else {
        alert("Failed crawling crawling.");
      }
    } catch (err) {
      console.error("Error while crawl:", err);
      alert("There are errors in Backend.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
          <h2 className="text-center text-3xl font-bold text-gray-900">SEO Tools Login</h2>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              required 
              className="w-full rounded-md border p-3" 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              className="w-full rounded-md border p-3" 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="submit" className="w-full rounded-md bg-blue-600 p-3 text-white hover:bg-blue-700">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">SEO Crawler v1.0</h1>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center text-gray-600 hover:text-red-500 text-sm">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </button>
      </nav>

      <main className="mx-auto max-w-6xl p-8">
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">Keywords finding</label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Example: 4G Unlimited Data" 
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <button 
              onClick={handleCrawl}
              disabled={loading}
              className="flex items-center rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Start Analysis'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm border-t-4 border-green-500">
            <h3 className="mb-4 text-lg font-semibold flex items-center">
              <Database className="mr-2 h-5 w-5 text-green-500" /> Integrate Cloud
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Supabase:</span> <span className="text-green-600 font-bold">Connected</span></div>
              <div className="flex justify-between"><span>Google Sheet:</span> <span className="text-green-600 font-bold">Live</span></div>
              <div className="flex justify-between"><span>Deployment:</span> <span className="text-blue-600 font-bold">Vercel</span></div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">The Last Crawling</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3">Entities</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((res, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 text-black">
                      <td className="px-4 py-3 font-medium text-gray-900">{res.Rank}</td> {/* R Besar */}
                      <td className="px-4 py-3 truncate max-w-[200px]">{res.URL}</td>   {/* URL Huruf Besar */}
                      <td className="px-4 py-3 text-blue-600 font-semibold">{res["Total Entities"]}</td> {/* Gunakan kurung siku karena ada spasi */}
                    </tr>
                  ))}
                  {results.length === 0 && !loading && (
                    <tr><td colSpan={3} className="py-8 text-center text-gray-400">No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}