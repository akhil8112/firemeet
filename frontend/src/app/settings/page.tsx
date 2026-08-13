"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile, preferences, and integrations.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Profile</h2>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
              DU
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-lg">Demo User</p>
              <p className="text-slate-500">demo@firemeet.app</p>
            </div>
          </div>
          <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Edit Profile
          </button>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Preferences</h2>
          <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
              <p className="font-medium text-slate-800">Theme</p>
              <p className="text-sm text-slate-500">Choose how FireMeet looks to you.</p>
            </div>
            <select 
              value={mounted ? theme : "light"}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
              <p className="font-medium text-slate-800">Email Notifications</p>
              <p className="text-sm text-slate-500">Receive emails for new meeting summaries.</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
              <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform" />
            </button>
          </div>
        </div>

        {/* Integrations Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Integrations</h2>
          <div className="space-y-4">
            {['Google Meet', 'Zoom', 'Calendar'].map((integration) => (
              <div key={integration} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                    {integration.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-800">{integration}</span>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
