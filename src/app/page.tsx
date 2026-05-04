import Sidebar from "@/components/Sidebar";
import ChannelList from "@/components/ChannelList";
import VoiceControls from "@/components/VoiceControls";
import ChatArea from "@/components/ChatArea";
import MusicPlayer from "@/components/MusicPlayer";
import Overlays from "@/components/Overlays";

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-aether-bg text-white font-sans mesh-gradient">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-aether-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-aether-pink/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Main Experience Layer */}
      <div className="flex h-screen w-full pt-20 pb-24 px-6 gap-6 relative z-10">
        {/* Left Navigation Stack */}
        <div className="w-80 flex flex-col gap-4">
           <ChannelList />
           <VoiceControls />
        </div>
        
        {/* Main Stage */}
        <ChatArea />
      </div>
      
      {/* Global Zonal Overlays */}
      <MusicPlayer />
      <Sidebar />
      <Overlays />

      {/* Subtle Frame */}
      <div className="fixed inset-0 pointer-events-none border-[1px] border-white/5 z-[100] opacity-30" />
    </div>
  );
}

