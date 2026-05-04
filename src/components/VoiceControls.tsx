"use client";

import { motion } from "framer-motion";
import { Mic, Headphones, Settings, Monitor, Video, Radio, Power, Sparkles, Users, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import Peer from "simple-peer";

export default function VoiceControls() {
  const { isMuted, setIsMuted, isDeafened, setIsDeafened, onlineUsers, activeChannelId, channels, profile, user } = useAppStore();
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Record<string, Peer.Instance>>({});
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const isInVoice = activeChannel?.type === 'voice';

  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio Context for Visualizer
  useEffect(() => {
    if (isInVoice && !stream && audioEnabled) {
      navigator.mediaDevices.getUserMedia({ 
        audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true } 
      }).then(s => {
        setStream(s);
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(s);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const draw = () => {
          if (!canvasRef.current) return;
          const ctx = canvasRef.current.getContext('2d');
          if (!ctx) return;
          analyser.getByteFrequencyData(dataArray);
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          const barWidth = (canvasRef.current.width / bufferLength) * 2.5;
          let x = 0;
          for(let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 4;
            ctx.fillStyle = `rgba(0, 242, 255, ${barHeight / 64})`;
            ctx.fillRect(x, canvasRef.current.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
          requestAnimationFrame(draw);
        };
        draw();
      }).catch(err => console.error("Mic Error:", err));
    }
    return () => {
      if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    };
  }, [isInVoice, audioEnabled]);

  // WebRTC Signaling Logic
  useEffect(() => {
    if (!isInVoice || !stream || !user) return;

    const signalingChannel = supabase.channel(`voice-signaling-${activeChannelId}`);

    signalingChannel
      .on('broadcast', { event: 'signal' }, (payload) => {
        const { from, signal, to } = payload.payload;
        if (to !== user.id) return;

        if (peers[from]) {
          peers[from].signal(signal);
        } else {
          // Create a new peer for the incoming connection
          const peer = new Peer({ initiator: false, trickle: false, stream });
          peer.on('signal', (data) => {
            signalingChannel.send({ type: 'broadcast', event: 'signal', payload: { from: user.id, to: from, signal: data } });
          });
          peer.on('stream', (remoteStream) => {
            setRemoteStreams(prev => ({ ...prev, [from]: remoteStream }));
          });
          peer.signal(signal);
          setPeers(prev => ({ ...prev, [from]: peer }));
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Notify others we are here
          onlineUsers.forEach(u => {
            if (u.id !== user.id) {
              const peer = new Peer({ initiator: true, trickle: false, stream });
              peer.on('signal', (data) => {
                signalingChannel.send({ type: 'broadcast', event: 'signal', payload: { from: user.id, to: u.id, signal: data } });
              });
              peer.on('stream', (remoteStream) => {
                setRemoteStreams(prev => ({ ...prev, [u.id]: remoteStream }));
              });
              setPeers(prev => ({ ...prev, [u.id]: peer }));
            }
          });
        }
      });

    return () => { 
      signalingChannel.unsubscribe();
      Object.values(peers).forEach(p => p.destroy());
      setPeers({});
      setRemoteStreams({});
    };
  }, [isInVoice, stream, user, activeChannelId, onlineUsers]);

  // Handle Mute
  useEffect(() => {
    if (stream) { stream.getAudioTracks().forEach(t => t.enabled = !isMuted); }
  }, [isMuted, stream]);

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-dock p-3 rounded-[32px] flex flex-col gap-4 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10 bg-white/[0.05] backdrop-blur-3xl w-full max-w-sm overflow-hidden"
    >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" width={400} height={100} />
        
        {/* Remote Audio Players (Hidden) */}
        {Object.entries(remoteStreams).map(([id, s]) => (
          <AudioPlayer key={id} stream={s} muted={isDeafened} />
        ))}

        {/* User Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-aether-cyan to-blue-600 flex items-center justify-center text-white font-black shadow-xl border border-white/10">
                {profile?.user_name?.[0] || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#030014] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white leading-tight tracking-tight">{profile?.user_name || "Kullanıcı"}</span>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Kristal Ses</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ControlButton 
              icon={noiseCancellation ? Sparkles : Radio} 
              active={noiseCancellation} 
              onClick={() => setNoiseCancellation(!noiseCancellation)} 
              label={noiseCancellation ? "Denoise Aktif" : "Denoise Kapalı"}
              className={noiseCancellation ? "text-aether-cyan bg-aether-cyan/10" : ""}
            />
            <ControlButton icon={Settings} active={true} label="Ses Motoru" />
          </div>
        </div>

        {/* Voice Presence & Controls */}
        {isInVoice && (
          <div className="space-y-3 pt-1 border-t border-white/5">
             {!audioEnabled && (
               <button 
                 onClick={() => setAudioEnabled(true)}
                 className="w-full py-3 bg-aether-cyan/20 border border-aether-cyan/30 rounded-2xl text-aether-cyan text-[10px] font-black uppercase tracking-widest hover:bg-aether-cyan/30 transition-all flex items-center justify-center gap-2"
               >
                 <Volume2 size={14} />
                 Sesi Etkinleştir
               </button>
             )}
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-aether-cyan animate-pulse shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
                   <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{activeChannel.name}</span>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] font-black text-aether-cyan uppercase tracking-tighter">
                   96kHz / 32-bit
                </div>
             </div>

             <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {onlineUsers.map((u: any) => (
                  <div key={u.id} className="relative group shrink-0">
                     <div className={cn(
                       "w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-bold text-white border transition-all",
                       u.is_muted ? "border-rose-500/50" : "border-white/10"
                     )}>
                        {u.user_name?.[0] || "?"}
                     </div>
                     {u.is_muted && (
                       <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center border border-[#030014]">
                          <Mic size={6} className="text-white" />
                       </div>
                     )}
                  </div>
                ))}
             </div>

             <div className="grid grid-cols-3 gap-2">
                <ActionToggle 
                  icon={<Mic size={18} />} 
                  label="Konuş" 
                  active={!isMuted} 
                  onClick={() => setIsMuted(!isMuted)} 
                  danger={isMuted}
                />
                <ActionToggle 
                  icon={<Headphones size={18} />} 
                  label="Dinle" 
                  active={!isDeafened} 
                  onClick={() => setIsDeafened(!isDeafened)} 
                  danger={isDeafened}
                />
                <ActionToggle 
                  icon={<Power size={18} />} 
                  label="Ayrıl" 
                  active={false}
                  danger
                />
             </div>
          </div>
        )}
      </motion.div>
  );
}

function AudioPlayer({ stream, muted }: { stream: MediaStream, muted: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch(e => console.error("Autoplay blocked:", e));
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline muted={muted} className="hidden" />;
}

function ActionToggle({ icon, label, active, onClick, danger }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all border",
        active 
          ? "bg-white/5 border-white/10 text-white" 
          : danger 
            ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
            : "bg-white/[0.02] border-white/5 text-white/20 hover:text-white"
      )}
    >
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function ControlButton({ icon: Icon, active, onClick, label, className }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group border border-transparent",
        active ? "text-white bg-white/10 border-white/10" : "text-white/20 hover:text-white hover:bg-white/5",
        className
      )}
    >
      <Icon size={18} />
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[9px] font-black uppercase tracking-tighter rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/10">
        {label}
      </div>
    </motion.button>
  );
}
