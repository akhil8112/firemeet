"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PlayCircle, PauseCircle, Calendar, Clock, CheckCircle2, Circle, Search, MoreVertical, Edit3, Trash2, Download, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { getMeeting, updateActionItem, updateMeeting, deleteMeeting, MeetingDetail } from "@/lib/api";
import { Transcript } from "@/components/Transcript";
import { toast } from "react-hot-toast";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = parseInt(params.id as string, 10);
  
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Edit/Delete State
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", date: "", duration: 0 });

  // Ask AI State
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
      const data = await getMeeting(meetingId);
      setMeeting(data);
      setEditForm({ 
        title: data.title, 
        date: new Date(data.date).toISOString().split("T")[0], 
        duration: data.duration 
      });
    } catch (error) {
      console.error("Failed to load meeting details", error);
      toast.error("Unable to load meeting. Try again.");
    } finally {
      setLoading(false);
    }
    };
    if (!isNaN(meetingId)) {
      fetchMeeting();
    }
  }, [meetingId]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleToggleAction = async (actionId: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await updateActionItem(actionId, { is_completed: newStatus });
      if (meeting) {
        setMeeting({
          ...meeting,
          action_items: meeting.action_items.map(a => 
            a.id === actionId ? { ...a, is_completed: newStatus } : a
          )
        });
      }
      if (newStatus) {
        toast.success("Action item completed!");
      }
    } catch (error) {
      console.error("Failed to update action item", error);
      toast.error("Failed to update action item");
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(error => {
            console.error("Audio playback failed during seek:", error);
            toast.error("Audio playback blocked. Please interact with the page first.");
          });
        }
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(error => {
            console.error("Audio playback failed:", error);
            toast.error("Failed to play audio. Check console.");
          });
        }
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure? This will permanently delete the meeting and all related data.")) {
      try {
        await deleteMeeting(meetingId);
        toast.success("Meeting deleted successfully");
        router.push("/meetings");
      } catch (error) {
        console.error("Failed to delete meeting", error);
        toast.error("Failed to delete meeting.");
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateMeeting(meetingId, {
        title: editForm.title,
        date: new Date(editForm.date).toISOString(),
        duration: editForm.duration
      });
      setMeeting((prev) => prev ? { ...prev, ...updated } : null);
      setIsEditing(false);
      setShowDropdown(false);
      toast.success("Meeting updated successfully");
    } catch (error) {
      console.error("Failed to update meeting", error);
      toast.error("Failed to update meeting.");
    }
  };

  const handleExport = () => {
    if (!meeting) return;
    const content = meeting.transcript_segments.map(s => `[${formatTimestamp(s.timestamp)}] ${s.speaker}: ${s.text}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, '_')}_Transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDropdown(false);
    toast.success("Transcript exported!");
  };

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    // Simulate AI delay
    setTimeout(() => {
      setAiResponse(`Based on the transcript, the key takeaway regarding "${aiQuery}" is that the team plans to finalize the document by next Tuesday and proceed with the initial rollout.`);
      setIsAiLoading(false);
      setAiQuery("");
    }, 1500);
  };

  if (loading) return <div className="p-8 text-slate-500">Loading meeting details...</div>;
  if (!meeting) return <div className="p-8 text-slate-500">Meeting not found.</div>;

  const audioSrc = "https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3";
  const progressPercentage = (currentTime / (meeting.duration * 60)) * 100;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col relative">
      <audio ref={audioRef} src={audioSrc} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />

      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link href="/meetings" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Meetings
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{meeting.title}</h1>
          <div className="flex items-center text-sm text-slate-500 space-x-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" /> {format(new Date(meeting.date), "MMMM d, yyyy")}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" /> {meeting.duration} minutes
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-600" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10">
              <button onClick={() => { setIsEditing(true); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Meeting
              </button>
              <button onClick={handleExport} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                <Download className="w-4 h-4 mr-2" /> Export Transcript
              </button>
              <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Meeting
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audio Player */}
      <div className="bg-slate-900 rounded-xl p-4 mb-6 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center space-x-4">
          <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-colors focus:outline-none">
            {isPlaying ? <PauseCircle className="w-10 h-10" /> : <PlayCircle className="w-10 h-10" />}
          </button>
          <div className="text-sm font-mono w-24 text-center">
            {formatTimestamp(currentTime)} / {formatTimestamp(meeting.duration * 60)}
          </div>
        </div>
        <div className="flex-1 mx-8 h-2 bg-slate-700 rounded-full relative overflow-hidden cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            handleSeek(((e.clientX - rect.left) / rect.width) * (meeting.duration * 60));
          }}>
          <div className="absolute top-0 left-0 h-full bg-primary-500 transition-all duration-100 ease-linear" style={{ width: `${Math.min(progressPercentage, 100)}%` }}></div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Column */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Summary</h3>
            {meeting.summary ? (
              <>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Overview</h4>
                <p className="text-slate-700 mb-6 leading-relaxed">{meeting.summary.overview}</p>
                {meeting.summary.topics.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Topics</h4>
                    <ul className="space-y-2">
                      {meeting.summary.topics.map(topic => (
                        <li key={topic.id} className="flex items-start text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 mr-2 flex-shrink-0"></span> {topic.name}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : <p className="text-slate-500 italic">No summary available.</p>}
            
            {/* Ask AI Section */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-500 flex items-center mb-3">
                <MessageSquare className="w-4 h-4 mr-2" /> Ask AI about this meeting
              </h4>
              <form onSubmit={handleAskAI} className="relative">
                <input 
                  type="text" 
                  value={aiQuery} 
                  onChange={(e) => setAiQuery(e.target.value)} 
                  disabled={isAiLoading}
                  placeholder='e.g., "What decisions were made?"'
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10" 
                />
                <button type="submit" disabled={isAiLoading || !aiQuery.trim()} className="absolute right-2 top-1.5 text-primary-600 hover:text-primary-700 disabled:opacity-50">
                  {isAiLoading ? <span className="animate-pulse">...</span> : "→"}
                </button>
              </form>
              {aiResponse && (
                <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 rounded-lg text-sm text-primary-700 dark:text-primary-100 leading-relaxed">
                  {aiResponse}
                </div>
              )}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Action Items</h3>
            {meeting.action_items.length > 0 ? (
              <div className="space-y-3">
                {meeting.action_items.map(action => (
                  <div key={action.id} className="flex items-start">
                    <button onClick={() => handleToggleAction(action.id, action.is_completed)} className="mt-0.5 mr-3 text-slate-400 hover:text-primary-600 transition-colors focus:outline-none">
                      {action.is_completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div>
                      <p className={`text-sm font-medium transition-colors ${action.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{action.description}</p>
                      <p className="text-xs text-slate-500 mt-1">Assigned to: {action.assigned_to}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500 italic">No action items.</p>}
          </div>
        </div>

        {/* Right Column: Transcript */}
        <div className="w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Transcript</h3>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Search transcript..." />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 relative">
            <Transcript segments={meeting.transcript_segments} currentTime={currentTime} onSeek={handleSeek} searchTerm={searchTerm} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Edit Meeting</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input required type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input required type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full px-3 py-2 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (min)</label>
                <input required type="number" min="1" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary-500" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
