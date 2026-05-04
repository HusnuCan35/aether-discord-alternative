"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { X, User, Settings, Shield, Bell, Moon, Globe, LogOut, Camera, Mail, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Overlays() {
  const { activeOverlay, setActiveOverlay, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    setActiveOverlay(null);
  };

  if (!activeOverlay) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm"
        onClick={() => setActiveOverlay(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl h-[80vh] glass-card rounded-[48px] overflow-hidden flex shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
        >
          {/* Sidebar */}
          <div className="w-64 border-r border-white/5 bg-white/[0.02] p-8 flex flex-col gap-8">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-aether-cyan to-aether-accent flex items-center justify-center text-white">
                 {activeOverlay === 'profile' ? <User size={20} /> : <Settings size={20} />}
              </div>
              <h2 className="text-xl font-bold text-white capitalize">{activeOverlay}</h2>
            </div>

            <nav className="flex flex-col gap-1">
              <NavItem icon={<User size={18} />} label="Account" active={activeOverlay === 'profile'} onClick={() => setActiveOverlay('profile')} />
              <NavItem icon={<Settings size={18} />} label="Preferences" active={activeOverlay === 'settings'} onClick={() => setActiveOverlay('settings')} />
              <NavItem icon={<Shield size={18} />} label="Privacy & Safety" />
              <NavItem icon={<Bell size={18} />} label="Notifications" />
              <div className="my-4 h-[1px] bg-white/5" />
              <NavItem icon={<LogOut size={18} />} label="Log Out" className="text-rose-500 hover:bg-rose-500/10" onClick={handleLogout} />
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-12 relative custom-scrollbar">
            <button 
              onClick={() => setActiveOverlay(null)}
              className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all"
            >
              <X size={24} />
            </button>

            {activeOverlay === 'profile' ? <ProfileView /> : 
             activeOverlay === 'settings' ? <SettingsView /> : 
             <AuthView />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: { user_name: userName } } 
        });
        if (error) throw error;
        alert("Registration successful! Please check your email (or just log in if email confirmation is disabled).");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tight">
          {isLogin ? "Welcome back" : "Create Account"}
        </h2>
        <p className="text-white/40 text-sm">Join the aether spatial experience.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Username</label>
            <input 
              type="text" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-aether-cyan transition-all"
              placeholder="StarPilot"
              required
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-aether-cyan transition-all"
            placeholder="pilot@aether.space"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-aether-cyan transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

        <button 
          disabled={loading}
          type="submit" 
          className="w-full py-4 bg-gradient-to-tr from-aether-cyan to-blue-600 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl hover:shadow-aether-cyan/20 transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <div className="text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-white/40 hover:text-white transition-all font-bold"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, className }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
        active ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ProfileView() {
  return (
    <div className="space-y-12">
      <div className="relative group">
        <div className="h-48 rounded-[32px] bg-gradient-to-tr from-aether-cyan/20 via-aether-accent/20 to-aether-pink/20 border border-white/5 overflow-hidden">
           <div className="absolute inset-0 bg-mesh opacity-30" />
        </div>
        <div className="absolute -bottom-12 left-10 flex items-end gap-6">
           <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-aether-cyan to-blue-500 border-8 border-[#030014] flex items-center justify-center text-4xl font-bold shadow-2xl relative">
              H
              <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[32px] transition-all">
                <Camera size={24} />
              </button>
           </div>
           <div className="pb-4">
              <h3 className="text-3xl font-black text-white tracking-tight">HusnuCan</h3>
              <p className="text-sm text-white/40 font-bold uppercase tracking-[0.2em]">Flow Master</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-20 pt-16">
        <div className="space-y-6">
           <ProfileField label="Display Name" value="HusnuCan" />
           <ProfileField label="Email" value="husnu@aether.space" />
        </div>
        <div className="space-y-6">
           <ProfileField label="Pronouns" value="He/Him" />
           <ProfileField label="Space ID" value="#0001" />
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">{label}</label>
      <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-medium flex items-center justify-between group-hover:border-white/10 transition-all">
        {value}
        <button className="text-xs text-aether-cyan font-bold hover:underline">Edit</button>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-2xl font-bold text-white mb-8">Interface Preferences</h3>
        <div className="space-y-4">
          <SettingsToggle icon={<Moon size={20} />} label="Dark Mode" description="Optimized for deep focus and visual comfort." enabled />
          <SettingsToggle icon={<Globe size={20} />} label="Spatial Layout" description="Enable fluid, zonal navigation throughout the workspace." enabled />
          <SettingsToggle icon={<Hash size={20} />} label="Compact Mode" description="Tighter spacing for high-density communication." />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-8">Space Aura</h3>
        <div className="grid grid-cols-3 gap-4">
           {['Cyan', 'Accent', 'Pink'].map(color => (
             <button key={color} className="aspect-video rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                <div className={cn("w-3 h-3 rounded-full", `bg-aether-${color.toLowerCase()}`)} />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">{color}</span>
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}

function SettingsToggle({ icon, label, description, enabled }: any) {
  return (
    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[32px] flex items-center justify-between hover:border-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">{label}</h4>
          <p className="text-xs text-white/30">{description}</p>
        </div>
      </div>
      <button className={cn(
        "w-12 h-6 rounded-full transition-all relative",
        enabled ? "bg-aether-cyan" : "bg-white/10"
      )}>
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
          enabled ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
