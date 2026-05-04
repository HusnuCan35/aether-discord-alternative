"use client";

import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import ChannelList from "@/components/ChannelList";
import VoiceControls from "@/components/VoiceControls";
import ChatArea from "@/components/ChatArea";
import UserList from "@/components/UserList";
import MusicPlayer from "@/components/MusicPlayer";
import Overlays from "@/components/Overlays";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const { user, activeOverlay, showUserList } = useAppStore();

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
      
      {/* Main Experience Layer - Spatial Layout */}
      <div className="relative h-screen w-full z-10 pointer-events-none">
        {/* Left Floating Modules */}
        <div className="absolute left-6 top-24 bottom-28 w-80 flex flex-col gap-4 pointer-events-auto">
           <ChannelList />
           <VoiceControls />
        </div>
        
        {/* Centered Main Stage */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <div className="w-[55%] min-w-[800px] h-[78vh] pointer-events-auto">
            <ChatArea />
          </div>
        </div>

        {/* Right Floating Modules */}
        <AnimatePresence>
          {showUserList && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-6 top-24 bottom-28 w-72 flex flex-col pointer-events-auto"
            >
              <UserList />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <MusicPlayer />
      <Sidebar />
      <Overlays />

      <div className="fixed inset-0 pointer-events-none border-[1px] border-white/5 z-[100] opacity-30" />
    </div>
  );
}
