"use client";

import { motion } from "framer-motion";
import { Plus, Compass, Settings, MessageSquare, Bell, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function Sidebar() {
  const { servers, activeServerId, setActiveServerId, setActiveOverlay } = useAppStore();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-dock p-3 rounded-[40px] flex items-center gap-3 pointer-events-auto shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 bg-white/[0.08] backdrop-blur-3xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-aether-accent/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
           <DockItem icon={<MessageSquare size={20} />} label="Mesajlar" active />
           <DockItem icon={<Search size={20} />} label="Ara" />
           <DockItem icon={<Bell size={20} />} label="Bildirimler" />
        </div>

        <div className="flex items-center gap-3">
          {servers.map((server) => (
            <motion.div
              key={server.id}
              whileHover={{ y: -8, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveServerId(server.id)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 relative group bg-gradient-to-br shadow-lg",
                server.color,
                activeServerId === server.id ? "scale-110 shadow-aether-cyan/40" : "opacity-60 hover:opacity-100"
              )}
            >
              <span className="text-xl z-10">{server.icon}</span>
              <div className={cn(
                "absolute inset-0 rounded-2xl bg-white/20 transition-opacity",
                activeServerId === server.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )} />
              
              {activeServerId === server.id && (
                <motion.div layoutId="server-active" className="absolute -left-3 w-1.5 h-8 bg-white rounded-r-full shadow-[0_0_15px_white]" />
              )}

              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-md text-white text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/10">
                {server.name}
              </div>
            </motion.div>
          ))}
          
          <motion.div
            whileHover={{ y: -8, scale: 1.1 }}
            className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center cursor-pointer text-white/50 hover:text-white hover:border-white/20 transition-all"
          >
            <Plus size={24} />
          </motion.div>
        </div>

        <div className="w-[1px] h-8 bg-white/10 mx-2" />

        <div className="flex items-center gap-1">
           <DockItem icon={<User size={20} />} label="Profil" onClick={() => setActiveOverlay('profile')} />
           <DockItem icon={<Settings size={20} />} label="Ayarlar" onClick={() => setActiveOverlay('settings')} />
        </div>
      </motion.div>
    </div>
  );
}

function DockItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean, onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.9 }}
      className="group relative"
    >
      <button 
        onClick={onClick}
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border",
          active 
            ? "bg-white/15 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
            : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/15"
        )}
      >
        {icon}
      </button>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/5">
        {label}
      </div>
    </motion.div>
  );
}
