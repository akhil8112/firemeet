"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Calendar, Clock, Users, Plus, Loader2 } from "lucide-react";
import { getMeetings, Meeting } from "@/lib/api";
import { toast } from "react-hot-toast";

function MeetingsDashboardContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await getMeetings();
        setMeetings(data);
      } catch (error) {
        console.error("Failed to load meetings", error);
        toast.error("Unable to load meetings. Try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Meetings</h1>
          <p className="text-slate-500 mt-1">Manage and review your past meetings</p>
        </div>
        <Link href="/create" className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          New Meeting
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 flex items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors sm:text-sm"
              placeholder="Search meetings..."
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
            <p>Loading meetings...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No meetings found</h3>
            <p className="text-slate-500">Get started by creating your first meeting summary.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMeetings.map((meeting) => (
              <Link href={`/meetings/${meeting.id}`} key={meeting.id} className="block hover:bg-slate-50 transition-colors p-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{meeting.title}</h3>
                    <div className="flex items-center text-sm text-slate-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {format(new Date(meeting.date), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {meeting.duration} min
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1.5" />
                        {meeting.participants.length} participants
                      </div>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {meeting.participants.slice(0, 3).map((p, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold" title={p.name}>
                        {p.name.charAt(0)}
                      </div>
                    ))}
                    {meeting.participants.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                        +{meeting.participants.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MeetingsDashboard() {
  return (
    <Suspense fallback={
      <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
        <p>Loading dashboard...</p>
      </div>
    }>
      <MeetingsDashboardContent />
    </Suspense>
  );
}
