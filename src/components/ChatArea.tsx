"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Hash, Bell, Users, Search, 
  Smile, Plus, Monitor, Camera, 
  Share2, Send, Paperclip, Mic, 
  Sparkles, MoreVertical
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function ChatArea() {
  const { messages, activeChannelId, sendMessage, aiEnhance, isScreenSharing, setIsScreenSharing } = useAppStore();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAIEnhance = async () => {
    if (!inputValue.trim()) return;
    const enhanced = await aiEnhance(inputValue);
    setInputValue(enhanced);
  };

  const currentMessages = messages[activeChannelId] || [];

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(activeChannelId, inputValue);
    setInputValue("");
  };

  return (
    <div className="flex-1 h-full flex flex-col p-4 z-10">
      {/* Main Chat Stage */}
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex-1 flex flex-col glass-card rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)] border border-white/10 pointer-events-auto"
      >
        {/* Stage Header */}
        <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-aether-cyan border border-white/10">
               <Hash size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Channel {activeChannelId}
                </h2>
                <p className="text-xs text-white/40 font-medium">Fluid communication active</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <StageAction icon={<Users size={20} />} />
             <StageAction icon={<Search size={20} />} />
             <StageAction icon={<MoreVertical size={20} />} />
          </div>
        </header>

        {/* Message Flow */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar scroll-smooth"
        >
           <AnimatePresence mode="popLayout">
              {currentMessages.map((msg) => (
                <Message key={msg.id} {...msg} />
              ))}
           </AnimatePresence>
        </div>

        {/* Detached Floating Input Area */}
        <form onSubmit={handleSend} className="p-8 pt-0">
          <motion.div 
            layout
            className="glass-dock rounded-[32px] p-2 flex items-center gap-2 shadow-2xl border border-white/10 group focus-within:border-white/20 transition-all"
          >
            <button type="button" className="w-12 h-12 rounded-full flex items-center justify-center text-white/40 hover:text-aether-cyan hover:bg-white/5 transition-all">
              <Plus size={24} />
            </button>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Manifest a message..."
              className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2"
            />
            <div className="flex items-center gap-1 pr-1">
               <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all">
                 <Smile size={20} />
               </button>
               <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all">
                 <Paperclip size={20} />
               </button>
               <motion.button 
                 type="submit"
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="w-12 h-12 rounded-[22px] bg-gradient-to-tr from-aether-cyan to-aether-accent text-white flex items-center justify-center shadow-lg shadow-aether-cyan/20"
               >
                 <Send size={20} />
               </motion.button>
            </div>
          </motion.div>
        </form>
      </motion.div>

      {/* Side Utilities (Floating) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
         <UtilityButton 
            icon={<Monitor size={22} />} 
            label={isScreenSharing ? "Stop Casting" : "Cast Screen"} 
            onClick={() => setIsScreenSharing(!isScreenSharing)} 
         />
         <UtilityButton 
            icon={<Sparkles size={22} />} 
            label="AI Enhance" 
            onClick={handleAIEnhance} 
         />
         <UtilityButton icon={<Bell size={22} />} label="Alerts" />
      </div>

      {/* Screen Share Overlay */}
      <AnimatePresence>
        {isScreenSharing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-aether-cyan/10 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/60 px-8 py-4 rounded-full border border-aether-cyan/30 flex items-center gap-4 animate-pulse">
               <Monitor className="text-aether-cyan" />
               <span className="text-white font-bold tracking-widest uppercase text-xs">Broadcasting Space...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageAction({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
      {icon}
    </button>
  );
}

function UtilityButton({ icon, onClick, label }: any) {
  return (
    <div className="group relative">
       <motion.button
         whileHover={{ x: -5 }}
         onClick={onClick}
         className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all shadow-xl"
       >
         {icon}
       </motion.button>
       <div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/10">
         {label}
       </div>
    </div>
  );
}

function Message({ id, user, content, time, bot }: any) {
  const { deleteMessage, updateMessage } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const handleUpdate = () => {
    updateMessage(id, editValue);
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-6 group relative"
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg relative",
        bot ? "bg-gradient-to-tr from-aether-accent to-aether-pink" : "bg-gradient-to-tr from-aether-cyan to-blue-500"
      )}>
        {user[0]}
        {bot && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[8px] text-black font-black flex items-center justify-center rounded-full border-2 border-[#030014]">
            AI
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className={cn("text-sm font-black tracking-tight", bot ? "text-aether-pink" : "text-white")}>
            {user}
          </span>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{time}</span>
          
          {/* Action Buttons (Only for non-bots) */}
          {!bot && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
               <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-bold text-aether-cyan hover:underline uppercase tracking-wider">Edit</button>
               <button onClick={() => deleteMessage(id)} className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-wider">Delete</button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-2 flex flex-col gap-2">
            <input 
              type="text" 
              value={editValue} 
              onChange={(e) => setEditValue(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-aether-cyan outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="text-[10px] font-black text-aether-cyan uppercase bg-aether-cyan/10 px-3 py-1.5 rounded-lg">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-[10px] font-black text-white/40 uppercase hover:text-white px-3 py-1.5 rounded-lg">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.03] p-4 rounded-[24px] rounded-tl-none border border-white/5 max-w-[80%] group-hover:border-white/10 transition-colors shadow-sm">
             <p className="text-[15px] text-white/80 leading-relaxed font-medium">{content}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
