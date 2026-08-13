import Link from "next/link";
import { Home, Video, Settings, Flame } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Flame className="w-6 h-6 text-primary-600 mr-2" />
        <span className="text-xl font-bold text-slate-800">FireMeet</span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        <Link href="/" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-lg transition-colors">
          <Home className="w-5 h-5 mr-3" />
          <span className="font-medium">Home</span>
        </Link>
        <Link href="/meetings" className="flex items-center px-4 py-3 bg-primary-50 text-primary-600 rounded-lg transition-colors">
          <Video className="w-5 h-5 mr-3" />
          <span className="font-medium">Meetings</span>
        </Link>
        <Link href="/settings" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-lg transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
}
