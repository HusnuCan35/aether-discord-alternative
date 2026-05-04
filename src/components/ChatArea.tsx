"use client";

import { motion } from "framer-motion";
import { Send, Hash, Users, Sparkles, Smile, Plus, Image as ImageIcon, Mic, Bell, Settings, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function ChatArea() {
  const { messages, activeChannelId, channels, sendMessage, aiEnhance, showUserList, setShowUserList } = useAppStore();
  const [inputValue, setInputValue] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const currentMessages = messages[activeChannelId] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(activeChannelId, inputValue);
    setInputValue("");
  };

  const handleAiEnhance = async () => {
    if (!inputValue.trim()) return;
    setIsEnhancing(true);
    const enhanced = await aiEnhance(inputValue);
    setInputValue(enhanced);
    setIsEnhancing(false);
  };

  return (
    <div className="w-full h-full flex flex-col glass-card rounded-[40px] overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] bg-white/[0.02] backdrop-blur-3xl relative">
      <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
      
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-aether-cyan shadow-inner">
             <Hash size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">{activeChannel?.name || "Kanal Seçilmedi"}</h2>
            <p className="text-xs text-white/30 font-medium tracking-wide">Uzay boşluğunda bir frekans...</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HeaderButton 
            icon={<Users size={20} />} 
            label="Üyeler" 
            active={showUserList}
            onClick={() => setShowUserList(!showUserList)} 
          />
          <HeaderButton icon={<Bell size={20} />} label="Bildirimler" />
          <div className="w-[1px] h-6 bg-white/10 mx-2" />
          <HeaderButton icon={<Settings size={20} />} label="Ayarlar" />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10"
      >
        {currentMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
             <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <MessageSquare size={32} />
             </div>
             <p className="text-sm font-medium italic">Henüz sinyal yok... İlk mesajı sen gönder!</p>
          </div>
        ) : (
          currentMessages.map((msg) => (
            <Message key={msg.id} {...msg} />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 relative z-10">
        <form 
          onSubmit={handleSend}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-aether-cyan/10 to-aether-pink/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-4 bg-white/[0.05] border border-white/10 rounded-[32px] p-2 pr-4 shadow-2xl backdrop-blur-xl group-focus-within:border-white/20 transition-all">
            <button type="button" className="p-3 hover:bg-white/5 rounded-2xl text-white/30 hover:text-white transition-all">
               <Plus size={24} />
            </button>
            
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`${activeChannel?.name || "mesaj"} kanalına mesaj gönder...`}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 font-medium py-4"
            />

            <div className="flex items-center gap-1">
               <button 
                 type="button"
                 onClick={handleAiEnhance}
                 disabled={isEnhancing}
                 className={cn(
                   "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                   isEnhancing ? "bg-white/10 text-white/40 animate-pulse" : "bg-aether-cyan/10 text-aether-cyan hover:bg-aether-cyan hover:text-black shadow-lg shadow-aether-cyan/10"
                 )}
               >
                 <Sparkles size={14} />
                 <span>{isEnhancing ? "Yapay Zeka..." : "AI Süsle"}</span>
               </button>
               <button type="button" className="p-3 text-white/20 hover:text-white transition-all">
                  <Smile size={24} />
               </button>
               <button type="submit" className="p-3 bg-white text-black rounded-2xl hover:bg-aether-cyan transition-all shadow-xl">
                  <Send size={24} />
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function HeaderButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2.5 rounded-xl transition-all group relative",
        active ? "bg-white/10 text-aether-cyan" : "text-white/30 hover:text-white hover:bg-white/5"
      )}
    >
       {icon}
       <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/5">
         {label}
       </div>
    </button>
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
          
          {!bot && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
               <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-bold text-aether-cyan hover:underline uppercase tracking-wider">Düzenle</button>
               <button onClick={() => deleteMessage(id)} className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-wider">Sil</button>
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
              <button onClick={handleUpdate} className="text-[10px] font-black text-aether-cyan uppercase bg-aether-cyan/10 px-3 py-1.5 rounded-lg">Kaydet</button>
              <button onClick={() => setIsEditing(false)} className="text-[10px] font-black text-white/40 uppercase hover:text-white px-3 py-1.5 rounded-lg">İptal</button>
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

