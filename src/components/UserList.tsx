"use client";

import { motion } from "framer-motion";
import { Users, Circle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function UserList() {
  const { onlineUsers } = useAppStore();

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 glass-card rounded-[32px] overflow-hidden pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 bg-white/[0.03] backdrop-blur-2xl h-full flex flex-col"
    >
      <div className="p-5 border-b border-white/5 flex items-center gap-3">
        <Users size={18} className="text-aether-cyan" />
        <h2 className="font-black text-white text-xs uppercase tracking-widest">Aktif Üyeler — {onlineUsers.length}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {onlineUsers.map((u: any) => (
          <div key={u.id} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-aether-cyan/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-all">
                {u.user_name?.[0] || "?"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#030014] rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white group-hover:text-aether-cyan transition-colors">{u.user_name}</span>
              <span className="text-[10px] text-white/20 font-medium uppercase tracking-tighter">Uzay Gezgini</span>
            </div>
          </div>
        ))}
        
        {onlineUsers.length === 0 && (
          <p className="text-[10px] text-white/20 text-center py-8 italic">Kimse yok... Henüz.</p>
        )}
      </div>
    </motion.div>
  );
}
