"use client";

import { Search, Bell } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/meetings?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
      <form onSubmit={handleSearch} className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-slate-100 sm:text-sm transition-colors"
          placeholder="Global search..."
        />
      </form>
      
      <div className="flex items-center space-x-4">
        <button className="text-slate-400 hover:text-slate-500 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
          DU
        </div>
      </div>
    </div>
  );
}
