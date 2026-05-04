"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Play, Pause, SkipForward, SkipBack, 
  Volume2, Music2, Search, X, 
  ChevronDown, ChevronUp, Layers,
  Link, Sparkles, RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { useAppStore } from "@/lib/store";

export default function MusicPlayer() {
  const { music, setMusicState, isDeafened, skipForward, skipBack } = useAppStore();
  const { currentSong, isPlaying, volume, progress, duration } = music;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fix Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync Volume & Deafen
  useEffect(() => {
    if (isIframeLoaded) {
      const targetVolume = isDeafened ? 0 : volume;
      sendCommand('setVolume', [targetVolume]);
    }
  }, [volume, isDeafened, isIframeLoaded]);

  // Command Helper
  const sendCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && isIframeLoaded) {
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func,
        args
      }), '*');
    }
  };

  // Poll for progress simulation
  useEffect(() => {
    if (!isIframeLoaded || !isPlaying) return;

    const interval = setInterval(() => {
      // Simulate progress since postMessage is tricky for return values without complex setup
      setMusicState({ progress: (progress + 0.1) % 100 });
    }, 1000);

    return () => clearInterval(interval);
  }, [isIframeLoaded, isPlaying, progress, duration, setMusicState]);

  // Sync Play/Pause
  useEffect(() => {
    if (isIframeLoaded && hasInteracted) {
      sendCommand(isPlaying ? 'playVideo' : 'pauseVideo');
    }
  }, [isPlaying, isIframeLoaded, hasInteracted]);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchMetadata = async (videoId: string) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      setMusicState({
        currentSong: {
          title: data.title,
          artist: data.author_name,
          videoId: videoId,
          thumbnail: data.thumbnail_url
        }
      });
    } catch (error) {
      console.error("Metadata fetch failed", error);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = getYoutubeId(newUrl);
    if (videoId) {
      setMusicState({
        currentSong: {
          title: "Fetching Metadata...",
          artist: "YouTube",
          videoId: videoId,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        },
        isPlaying: true,
        progress: 0
      });
      setNewUrl("");
      setHasInteracted(true);
      setIsIframeLoaded(false);
      await fetchMetadata(videoId);
    }
  };

  const togglePlay = () => {
    if (!hasInteracted) setHasInteracted(true);
    setMusicState({ isPlaying: !isPlaying });
  };

  // YouTube URL to Iframe Source
  const videoUrl = useMemo(() => {
    if (!mounted) return "";
    return `https://www.youtube.com/embed/${currentSong.videoId}?enablejsapi=1&origin=${window.location.origin}&controls=0&modestbranding=1&rel=0`;
  }, [currentSong.videoId, mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        layout
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "bg-white/[0.03] backdrop-blur-3xl border border-white/20 rounded-[32px] pointer-events-auto overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative group/player",
          isExpanded ? "w-[480px] p-8" : "w-[360px] p-2 pr-4"
        )}
      >
        {/* Animated Glow Border */}
        <div className="absolute inset-0 rounded-[32px] p-[1px] bg-gradient-to-tr from-aether-cyan/20 via-white/5 to-aether-pink/20 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          {/* Album Art / Thumbnail */}
          <motion.div 
            layout
            className={cn(
              "relative rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/5",
              isExpanded ? "w-28 h-28" : "w-11 h-11"
            )}
          >
            <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="flex gap-1 items-end h-4">
                    {[1,2,3,4,5].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 16, 8, 14, 4] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className="w-1 bg-aether-cyan rounded-full shadow-[0_0_8px_rgba(0,242,255,0.5)]"
                      />
                    ))}
                 </div>
              </div>
            )}
          </motion.div>

          {/* Info & Basic Controls */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <motion.h4 layout className="text-[15px] font-bold truncate text-white tracking-tight">
                {currentSong.title}
              </motion.h4>
              <motion.p layout className="text-[10px] text-white/40 font-medium truncate uppercase tracking-widest">
                {currentSong.artist}
              </motion.p>
            </div>
            
            {!isExpanded && (
               <div className="flex items-center gap-4 mt-2">
                 <SkipBack size={16} className="text-white/30 cursor-pointer hover:text-white transition-colors" onClick={skipBack} />
                 {isPlaying ? (
                    <Pause size={18} fill="white" className="text-white cursor-pointer" onClick={togglePlay} />
                 ) : (
                    <Play size={18} fill="white" className="text-white cursor-pointer ml-0.5" onClick={togglePlay} />
                 )}
                 <SkipForward size={16} className="text-white/30 cursor-pointer hover:text-white transition-colors" onClick={skipForward} />
               </div>
            )}
          </div>

          {/* Expand Toggle */}
          <motion.button
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </motion.button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 space-y-8"
            >
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-aether-cyan via-aether-accent to-aether-pink shadow-[0_0_15px_rgba(112,0,255,0.5)]"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/20 font-bold uppercase tracking-widest">
                  <span>{isPlaying ? "PLAYING" : "PAUSED"}</span>
                  <div className="flex items-center gap-2">
                    {isDeafened && <span className="text-rose-500">DEAFENED - MUTED</span>}
                    <RefreshCcw size={10} className={cn(isPlaying && "animate-spin-slow")} />
                    <span>Synchronizing</span>
                  </div>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-10">
                <button className="text-white/20 hover:text-white transition-all scale-125" onClick={skipBack}>
                  <SkipBack size={28} />
                </button>
                <motion.button 
                  whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(0,242,255,0.2)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-[28px] bg-white text-black flex items-center justify-center transition-all shadow-2xl"
                >
                  {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                </motion.button>
                <button className="text-white/20 hover:text-white transition-all scale-125" onClick={skipForward}>
                  <SkipForward size={28} />
                </button>
              </div>

              {/* YouTube Link Area */}
              <form onSubmit={handleUrlSubmit} className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-aether-cyan transition-colors">
                    <Link size={16} />
                 </div>
                 <input 
                    type="text" 
                    placeholder="Paste YouTube Link..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white outline-none focus:border-aether-cyan/30 focus:bg-white/[0.08] transition-all"
                 />
                 <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white text-white hover:text-black p-1.5 rounded-xl transition-all">
                    <Sparkles size={14} />
                 </button>
              </form>

              {/* Volume & Extras */}
              <div className="flex items-center gap-5 pt-6 border-t border-white/5">
                <Volume2 size={18} className="text-white/20" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={volume}
                  onChange={(e) => setMusicState({ volume: parseInt(e.target.value) })}
                  className="flex-1 accent-aether-cyan h-1 bg-white/5 rounded-full appearance-none cursor-pointer hover:bg-white/10 transition-all"
                />
                <button className="p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <Layers size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NATIVE YOUTUBE IFRAME CORE */}
        <div className="fixed top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden z-[-1]">
          <iframe
            ref={iframeRef}
            id="nebula-yt-player"
            width="100%"
            height="100%"
            src={videoUrl}
            title="Aether Media Engine"
            onLoad={() => {
              setIsIframeLoaded(true);
              if (isPlaying && hasInteracted) {
                setTimeout(() => {
                  sendCommand('playVideo');
                  sendCommand('setVolume', [isDeafened ? 0 : volume]);
                }, 500);
              }
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      </motion.div>
    </div>
  );
}
