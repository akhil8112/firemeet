import { useEffect, useRef } from "react";
import { TranscriptSegment } from "@/lib/api";

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Helper to highlight search terms
function highlightText(text: string, highlight: string) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-slate-900 rounded px-1">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

interface TranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  searchTerm: string;
}

export function Transcript({ segments, currentTime, onSeek, searchTerm }: TranscriptProps) {
  const activeSegmentRef = useRef<HTMLDivElement | null>(null);

  // Find the currently active segment based on audio time
  // It's the last segment whose timestamp is <= currentTime
  let activeIndex = -1;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].timestamp <= currentTime) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  // Filter segments if there's a search term
  const displayedSegments = searchTerm.trim() === "" 
    ? segments 
    : segments.filter(s => s.text.toLowerCase().includes(searchTerm.toLowerCase()) || s.speaker.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col space-y-2 pb-20">
      {displayedSegments.map((segment, index) => {
        const isActive = segment.timestamp <= currentTime && 
                         (index === segments.length - 1 || segments[index + 1].timestamp > currentTime);
        
        return (
          <div 
            key={segment.id} 
            ref={isActive && searchTerm === "" ? activeSegmentRef : null}
            onClick={() => onSeek(segment.timestamp)}
            className={`flex group p-3 -mx-3 rounded-lg transition-colors cursor-pointer ${
              isActive ? "bg-primary-50 border-l-4 border-primary-500 pl-2" : "hover:bg-slate-50 border-l-4 border-transparent pl-2"
            }`}
          >
            <div className={`w-16 flex-shrink-0 text-sm font-medium font-mono mt-1 transition-colors ${
              isActive ? "text-primary-700" : "text-slate-400 group-hover:text-primary-600"
            }`}>
              {formatTimestamp(segment.timestamp)}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-semibold mb-1 ${isActive ? "text-primary-900" : "text-slate-900"}`}>
                {highlightText(segment.speaker, searchTerm)}
              </div>
              <p className={`leading-relaxed ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                {highlightText(segment.text, searchTerm)}
              </p>
            </div>
          </div>
        );
      })}
      
      {displayedSegments.length === 0 && (
        <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          {searchTerm ? "No transcript segments match your search." : "No transcript available for this meeting."}
        </div>
      )}
    </div>
  );
}
