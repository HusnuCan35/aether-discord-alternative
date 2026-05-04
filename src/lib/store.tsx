"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

interface Song {
  title: string;
  artist: string;
  videoId: string;
  thumbnail: string;
}

interface Message {
  id: number;
  user: string;
  content: string;
  time: string;
  bot?: boolean;
}

interface Server {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Channel {
  id: number;
  server_id: number;
  name: string;
  type: 'text' | 'voice';
  icon_type: string;
}

interface VoiceUser {
  id: number;
  user_name: string;
  is_muted: boolean;
  is_deafened: boolean;
}

interface AppState {
  user: User | null;
  profile: {
    user_name: string;
    avatar_url?: string;
  } | null;
  servers: Server[];
  channels: Channel[];
  activeServerId: number;
  activeChannelId: number;
  activeOverlay: 'profile' | 'settings' | 'auth' | null;
  isMuted: boolean;
  isDeafened: boolean;
  isScreenSharing: boolean;
  messages: Record<number, Message[]>;
  voiceUsers: VoiceUser[];
  music: {
    currentSong: Song;
    isPlaying: boolean;
    volume: number;
    progress: number;
    duration: number;
  };
}

interface AppStore extends AppState {
  setUser: (user: User | null) => void;
  setActiveOverlay: (overlay: AppState["activeOverlay"]) => void;
  setActiveServerId: (id: number) => void;
  setActiveChannelId: (id: number) => void;
  setIsMuted: (muted: boolean) => void;
  setIsDeafened: (deafened: boolean) => void;
  setIsScreenSharing: (sharing: boolean) => void;
  sendMessage: (channelId: number, content: string) => void;
  updateMessage: (messageId: number, content: string) => void;
  deleteMessage: (messageId: number) => void;
  createChannel: (name: string, type: 'text' | 'voice', icon_type: string) => void;
  updateChannel: (channelId: number, updates: Partial<Channel>) => void;
  deleteChannel: (channelId: number) => void;
  aiEnhance: (text: string) => Promise<string>;
  setMusicState: (updates: Partial<AppState["music"]>) => void;
  skipForward: () => void;
  skipBack: () => void;
  logout: () => void;
}

const AppContext = createContext<AppStore | undefined>(undefined);

const PLAYLIST: Song[] = [
  { title: "Stardust - Nova Drive", artist: "Midnight Aether", videoId: "jfKfPfyJRdk", thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop" },
  { title: "Neon Nights", artist: "Cyber Synth", videoId: "5qap5aO4i9A", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop" },
  { title: "Retro Wave", artist: "Lofi Dream", videoId: "17X8X1v9A7M", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop" }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [songIndex, setSongIndex] = useState(0);
  const [state, setState] = useState<AppState>({
    user: null,
    profile: null,
    servers: [],
    channels: [],
    activeServerId: 1,
    activeChannelId: 1,
    activeOverlay: 'auth', // Default to auth if no user
    isMuted: false,
    isDeafened: false,
    isScreenSharing: false,
    messages: {},
    voiceUsers: [],
    music: { currentSong: PLAYLIST[0], isPlaying: false, volume: 50, progress: 0, duration: 0 }
  });

  // Auth Handling
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState(prev => ({ ...prev, user: session.user, activeOverlay: null, profile: { user_name: session.user.user_metadata.user_name || session.user.email?.split('@')[0] } }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setState(prev => ({ ...prev, user: session.user, activeOverlay: null, profile: { user_name: session.user.user_metadata.user_name || session.user.email?.split('@')[0] } }));
      } else {
        setState(prev => ({ ...prev, user: null, activeOverlay: 'auth' }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    const { data: servers } = await supabase.from('servers').select('*');
    const { data: channels } = await supabase.from('channels').select('*');
    if (servers && channels) {
      setState(prev => ({ 
        ...prev, 
        servers, 
        channels,
        activeServerId: prev.activeServerId || servers[0]?.id || 1,
        activeChannelId: prev.activeChannelId || channels.find(c => c.server_id === (prev.activeServerId || servers[0]?.id))?.id || 1
      }));
    }
  }, []);

  useEffect(() => {
    if (state.user) fetchData();
  }, [state.user, fetchData]);

  // Messages & Voice Subscriptions (Same as before but check user)
  useEffect(() => {
    if (!state.user || !state.activeChannelId) return;
    
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('channel_id', state.activeChannelId).order('created_at', { ascending: true });
      if (data) {
        setState(prev => ({
          ...prev,
          messages: {
            ...prev.messages,
            [state.activeChannelId]: data.map(m => ({
              id: m.id,
              user: m.user_name,
              content: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bot: m.is_bot
            }))
          }
        }));
      }
    };
    fetchMessages();

    const channel = supabase.channel(`messages-${state.activeChannelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${state.activeChannelId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage: Message = { id: payload.new.id, user: payload.new.user_name, content: payload.new.content, time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), bot: payload.new.is_bot };
          setState(prev => ({ ...prev, messages: { ...prev.messages, [state.activeChannelId]: [...(prev.messages[state.activeChannelId] || []), newMessage] } }));
        } else if (payload.eventType === 'UPDATE') {
          setState(prev => ({ ...prev, messages: { ...prev.messages, [state.activeChannelId]: (prev.messages[state.activeChannelId] || []).map(m => m.id === payload.new.id ? { ...m, content: payload.new.content } : m) } }));
        } else if (payload.eventType === 'DELETE') {
          setState(prev => ({ ...prev, messages: { ...prev.messages, [state.activeChannelId]: (prev.messages[state.activeChannelId] || []).filter(m => m.id !== payload.old.id) } }));
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [state.activeChannelId, state.user]);

  // Voice Sync
  useEffect(() => {
    if (!state.user) return;
    const syncState = async () => {
      const channelObj = state.channels.find(c => c.id === state.activeChannelId);
      if (channelObj?.type === 'voice') {
        await supabase.from('voice_states').upsert({ 
          channel_id: state.activeChannelId, 
          user_name: state.profile?.user_name || "Guest", 
          is_muted: state.isMuted, 
          is_deafened: state.isDeafened,
          updated_at: new Date().toISOString()
        }, { onConflict: 'channel_id,user_name' });
      }
    };
    syncState();
  }, [state.isMuted, state.isDeafened, state.activeChannelId, state.channels, state.user, state.profile]);

  // Actions
  const setUser = (user: User | null) => setState(prev => ({ ...prev, user }));
  const setActiveOverlay = (overlay: AppState["activeOverlay"]) => setState(prev => ({ ...prev, activeOverlay: overlay }));
  const setActiveServerId = (id: number) => {
    const firstChannel = state.channels.find(c => c.server_id === id);
    setState(prev => ({ ...prev, activeServerId: id, activeChannelId: firstChannel ? firstChannel.id : prev.activeChannelId }));
  };
  const setActiveChannelId = (id: number) => setState(prev => ({ ...prev, activeChannelId: id }));
  const setIsMuted = (muted: boolean) => setState(prev => ({ ...prev, isMuted: muted }));
  const setIsDeafened = (deafened: boolean) => setState(prev => ({ ...prev, isDeafened: deafened, isMuted: deafened ? true : prev.isMuted }));
  const setIsScreenSharing = (sharing: boolean) => setState(prev => ({ ...prev, isScreenSharing: sharing }));
  const logout = () => supabase.auth.signOut();
  
  const sendMessage = useCallback(async (channelId: number, content: string) => {
    await supabase.from('messages').insert([{ channel_id: channelId, user_name: state.profile?.user_name || "Guest", content }]);
  }, [state.profile]);

  const updateMessage = async (messageId: number, content: string) => {
    await supabase.from('messages').update({ content }).eq('id', messageId);
  };

  const deleteMessage = async (messageId: number) => {
    await supabase.from('messages').delete().eq('id', messageId);
  };

  const createChannel = async (name: string, type: 'text' | 'voice', icon_type: string) => {
    await supabase.from('channels').insert([{ server_id: state.activeServerId, name, type, icon_type }]);
  };

  const updateChannel = async (channelId: number, updates: Partial<Channel>) => {
    await supabase.from('channels').update(updates).eq('id', channelId);
  };

  const deleteChannel = async (channelId: number) => {
    await supabase.from('channels').delete().eq('id', channelId);
  };

  const aiEnhance = async (text: string) => {
    const enhancements = [" ☄️ (Aether Geliştirildi)", " ✨ (Uzamsal Netlik)", " 🚀 (Akıcı Momentum)"];
    return text.charAt(0).toUpperCase() + text.slice(1) + enhancements[Math.floor(Math.random() * enhancements.length)];
  };

  const setMusicState = (updates: Partial<AppState["music"]>) => setState(prev => ({ ...prev, music: { ...prev.music, ...updates } }));
  const skipForward = () => setSongIndex(prev => (prev + 1) % PLAYLIST.length);
  const skipBack = () => setSongIndex(prev => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);

  return (
    <AppContext.Provider value={{ 
      ...state, setUser, setActiveOverlay, setActiveServerId, setActiveChannelId, setIsMuted, setIsDeafened, 
      setIsScreenSharing, sendMessage, updateMessage, deleteMessage, createChannel, updateChannel, deleteChannel,
      aiEnhance, setMusicState, skipForward, skipBack, logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useAppStore must be used within an AppProvider");
  return context;
}
