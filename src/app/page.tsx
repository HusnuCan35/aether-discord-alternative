"use client";

import Sidebar from "@/components/Sidebar";
import ChannelList from "@/components/ChannelList";
import VoiceControls from "@/components/VoiceControls";
import ChatArea from "@/components/ChatArea";
import MusicPlayer from "@/components/MusicPlayer";
import Overlays from "@/components/Overlays";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const { user, activeOverlay } = useAppStore();

  // Strict Auth Enforcement: If no user and auth overlay is active, ONLY show auth
  if (!user && activeOverlay === 'auth') {
    return (
      <div className="relative h-screen w-full bg-aether-bg overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <Overlays />
      </div>
    );
  }

  // Loading state while checking session
  if (!user && activeOverlay !== 'auth') {
    return (
      <div className="relative h-screen w-full bg-aether-bg flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-aether-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,255,0.4)]" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-aether-bg text-white font-sans mesh-gradient">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-aether-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-aether-pink/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Main Experience Layer */}
      <div className="flex h-screen w-full pt-20 pb-24 px-6 gap-6 relative z-10">
        <div className="w-80 flex flex-col gap-4">
           <ChannelList />
           <VoiceControls />
        </div>
        <ChatArea />
      </div>
      
      <MusicPlayer />
      <Sidebar />
      <Overlays />

      <div className="fixed inset-0 pointer-events-none border-[1px] border-white/5 z-[100] opacity-30" />
    </div>
  );
}
