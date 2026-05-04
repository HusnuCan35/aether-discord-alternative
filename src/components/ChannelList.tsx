"use client";

import { motion } from "framer-motion";
import { Hash, Volume2, Radio, Video, ChevronDown, Plus, Settings, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const ICON_MAP: Record<string, any> = {
  Hash,
  Volume2,
  Radio,
  Video,
};

export default function ChannelList() {
  const { channels, servers, activeChannelId, setActiveChannelId, activeServerId, createChannel } = useAppStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<'text' | 'voice'>('text');

  const currentServer = servers.find(s => s.id === activeServerId);
  const serverChannels = channels.filter(c => c.server_id === activeServerId);
  
  const textChannels = serverChannels.filter(c => c.type === 'text');
  const voiceChannels = serverChannels.filter(c => c.type === 'voice');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createChannel(newName, newType, newType === 'text' ? 'Hash' : 'Volume2');
    setNewName("");
    setIsCreating(false);
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 glass-card rounded-[32px] overflow-hidden pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 bg-white/[0.03] backdrop-blur-2xl relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-aether-cyan/5 to-transparent pointer-events-none" />
      <div className="flex flex-col max-h-[60vh]">
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-aether-cyan to-aether-accent flex items-center justify-center text-white font-bold">
              {currentServer?.name?.[0] || "A"}
            </div>
            <h1 className="font-bold text-white text-sm tracking-tight">{currentServer?.name || "Aether Uzayı"}</h1>
          </div>
          <ChevronDown size={16} className="text-white/40" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
          <Category title="Akışlar" channels={textChannels} activeId={activeChannelId} />
          <Category title="Atmosferler" channels={voiceChannels} activeId={activeChannelId} />
          
          {isCreating && (
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCreate} 
              className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3"
            >
              <input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Kanal adı..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-aether-cyan"
                autoFocus
              />
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setNewType('text')}
                  className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase", newType === 'text' ? "bg-aether-cyan text-black" : "bg-white/5 text-white/40")}
                >
                  Metin
                </button>
                <button 
                  type="button" 
                  onClick={() => setNewType('voice')}
                  className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase", newType === 'voice' ? "bg-aether-cyan text-black" : "bg-white/5 text-white/40")}
                >
                  Ses
                </button>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest">Oluştur</button>
                <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-2 text-[10px] font-black text-white/20 uppercase">X</button>
              </div>
            </motion.form>
          )}
        </div>
        
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="p-4 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-xs font-medium text-white/60"
          >
             <Plus size={14} />
             <span>Yeni Kanal Oluştur</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Category({ title, channels, activeId }: any) {
  return (
    <div className="space-y-2">
      <h3 className="px-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{title}</h3>
      <div className="space-y-1">
        {channels.map((channel: any) => (
          <ChannelItem 
            key={channel.id} 
            channel={channel} 
            active={activeId === channel.id} 
          />
        ))}
      </div>
    </div>
  );
}

function ChannelItem({ channel, active }: { channel: any; active: boolean }) {
  const { setActiveChannelId, deleteChannel, updateChannel } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(channel.name);
  const Icon = ICON_MAP[channel.icon_type] || Hash;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateChannel(channel.id, { name: editValue });
    setIsEditing(false);
  };

  return (
    <div className="group relative flex items-center gap-1">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex-1 ml-4 flex items-center gap-2">
           <input 
             value={editValue} 
             onChange={(e) => setEditValue(e.target.value)}
             className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none"
             autoFocus
           />
           <button type="submit" className="text-[10px] text-aether-cyan font-bold uppercase">Kaydet</button>
        </form>
      ) : (
        <button
          onClick={() => setActiveChannelId(channel.id)}
          className={cn(
            "flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300",
            active ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Icon size={18} className={cn(active ? "text-aether-cyan" : "text-white/20")} />
          <span className="text-sm font-medium tracking-tight">{channel.name}</span>
          
          {active && (
            <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-aether-cyan rounded-full" />
          )}
        </button>
      )}

      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all pr-2">
           <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/20 hover:text-aether-cyan transition-all">
              <Settings size={14} />
           </button>
           <button onClick={() => deleteChannel(channel.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/20 hover:text-rose-500 transition-all">
              <X size={14} />
           </button>
        </div>
      )}
    </div>
  );
}
