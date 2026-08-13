"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { createMeeting, uploadTranscript } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function CreateMeetingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    duration: 60,
    participants: "",
    transcript: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create meeting
      const participantNames = formData.participants.split(",").map(p => p.trim()).filter(Boolean);
      
      const newMeeting = await createMeeting({
        title: formData.title,
        date: new Date(formData.date).toISOString(),
        duration: Number(formData.duration),
        participant_names: participantNames
      });

      // 2. Upload transcript if provided
      if (formData.transcript.trim()) {
        await uploadTranscript(newMeeting.id, formData.transcript);
      }

      // 3. Redirect to new meeting detail page
      toast.success("Meeting created successfully!");
      router.push(`/meetings/${newMeeting.id}`);
    } catch (error) {
      console.error("Failed to create meeting", error);
      toast.error("Unable to create meeting. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, transcript: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <Link href="/meetings" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Meetings
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">Create Meeting</h1>
        <p className="text-slate-500 mt-1">Add a new meeting and upload its transcript.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="e.g. Q4 Marketing Strategy"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (minutes)</label>
              <input
                required
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Participants (comma separated)</label>
            <input
              required
              type="text"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Sarah, John, Mike"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between">
              <span>Transcript (.txt format)</span>
              <span className="text-xs font-normal text-slate-400">Format: [MM:SS] Speaker: Text</span>
            </label>
            <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500">
              <textarea
                rows={8}
                value={formData.transcript}
                onChange={handleTextareaChange}
                className="w-full px-4 py-3 border-none focus:ring-0 text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="[00:00] Sarah: Welcome everyone...&#10;[00:15] John: Let's discuss the roadmap."
              />
              <div className="bg-slate-50 px-4 py-2 border-t border-slate-300 flex justify-between items-center text-xs text-slate-500">
                <span>Supports plain text format</span>
                <Upload className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/meetings')}
              className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors mr-4"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg transition-colors flex items-center shadow-sm disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
